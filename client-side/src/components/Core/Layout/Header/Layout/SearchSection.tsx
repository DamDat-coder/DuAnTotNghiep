"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useLookup } from "@/contexts/LookupContext";
import { fetchProductBySlug, fetchProducts, recommendProducts } from "@/services/productApi";
import { IProduct } from "@/types/product";
import { motion } from "framer-motion";
import { debounce } from "lodash";
import SearchInput from "../LookupMenu/SearchInput";
import SearchSuggestions from "../LookupMenu/SearchSuggestions";
import SearchResults from "../LookupMenu/SearchResults";
import { convertToSlug } from "@/utils/slugify";
import { useCart } from "@/contexts/CartContext";

// Định nghĩa kiểu RecommendResponse
interface RecommendResponse {
  success: boolean;
  outfits?: any[];
  data: IProduct[];
}

export default function SearchSection() {
  const { isLookupOpen, setIsLookupOpen } = useLookup();
  const { items } = useCart();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<IProduct[]>([]);
  const [suggestedProducts, setSuggestedProducts] = useState<IProduct[]>([]);
  const [isSuggestedLoading, setIsSuggestedLoading] = useState(true);
  const [suggestedError, setSuggestedError] = useState<string | null>(null);
  const cache = useRef<{ [key: string]: IProduct[] }>({});
  const prevCartIdsRef = useRef<string[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const lookupButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    console.log("Cart items:", items);
    const cartIds = [...new Set(items.map((item) => item.id))];
    console.log("Cart IDs:", cartIds);
    const cartIdsKey = cartIds.join(",");
    console.log("Cart IDs Key:", cartIdsKey);

    if (cartIdsKey === prevCartIdsRef.current.join(",")) {
      console.log("Cart IDs không thay đổi, bỏ qua gọi API");
      setIsSuggestedLoading(false);
      return;
    }

    if (cache.current[cartIdsKey]) {
      console.log("Lấy từ cache:", cache.current[cartIdsKey]);
      setSuggestedProducts(cache.current[cartIdsKey]);
      prevCartIdsRef.current = cartIds;
      setIsSuggestedLoading(false);
      return;
    }

    async function fetchSuggestedProducts() {
      let hasFallbackData = false;
      try {
        setIsSuggestedLoading(true);
        setSuggestedError(null);

        // Bước 1: Gọi fetchProducts trước (nhanh hơn)
        console.log("Gọi fetchProducts (fallback)");
        const fallbackProducts = await fetchProducts({
          sort_by: "best_selling",
          is_active: true,
          limit: 5,
        });
        console.log("Kết quả từ fetchProducts:", fallbackProducts.data);
        cache.current[cartIdsKey] = fallbackProducts.data || [];
        setSuggestedProducts(fallbackProducts.data || []);
        prevCartIdsRef.current = cartIds;
        hasFallbackData = true;

        // Bước 2: Gọi recommendProducts với timeout 10 giây
        const userBehavior = {
          viewed: [],
          cart: cartIds,
        };
        console.log("Gửi yêu cầu recommendProducts với:", userBehavior);

        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error("Timeout: recommendProducts quá lâu")), 10000);
        });

        const recommendPromise = recommendProducts(userBehavior);
        const response = (await Promise.race([recommendPromise, timeoutPromise])) as unknown as RecommendResponse;

        // Chỉ cập nhật nếu recommendProducts trả về dữ liệu hợp lệ
        if (response && response.success && response.data && response.data.length > 0) {
          console.log("Kết quả từ recommendProducts:", response.data);
          cache.current[cartIdsKey] = response.data;
          setSuggestedProducts(response.data);
        } else {
          console.log("recommendProducts không trả về dữ liệu hợp lệ, giữ dữ liệu từ fetchProducts");
        }
      } catch (error: any) {
        console.error("Lỗi khi lấy sản phẩm:", error);
        if (!hasFallbackData) {
          setSuggestedError(`Lỗi khi lấy sản phẩm: ${error.message || "Lỗi không xác định"}`);
          setSuggestedProducts([]);
        } else {
          console.log("Giữ dữ liệu từ fetchProducts, không hiển thị lỗi");
        }
      } finally {
        setIsSuggestedLoading(false);
      }
    }

    fetchSuggestedProducts();
  }, [items]);

  const debouncedSearch = debounce(async (term: string) => {
    if (term.trim() === "") {
      setFilteredProducts([]);
      return;
    }
    try {
      setIsLoading(true);
      const slug = convertToSlug(term);
      const result = await fetchProductBySlug(slug, false);
      setFilteredProducts(Array.isArray(result) ? result : result ? [result] : []);
    } catch (error) {
      console.error("Lỗi khi tìm kiếm sản phẩm:", error);
      setFilteredProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, 300);

  useEffect(() => {
    debouncedSearch(searchTerm);
    return () => debouncedSearch.cancel();
  }, [searchTerm]);

  useEffect(() => {
    console.log("isLookupOpen thay đổi:", isLookupOpen); // Debug isLookupOpen
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !inputRef.current?.contains(target) &&
        !menuRef.current?.contains(target) &&
        !lookupButtonRef.current?.contains(target)
      ) {
        setIsLookupOpen(false);
      }
    };
    if (isLookupOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isLookupOpen, setIsLookupOpen]);

  const handleResultClick = () => {
    setIsLookupOpen(false);
    setSearchTerm("");
    setFilteredProducts([]);
  };

  // Log để debug trước khi render
  console.log("isSuggestedLoading:", isSuggestedLoading);
  console.log("isLoading:", isLoading);
  console.log("suggestedProducts:", suggestedProducts);
  console.log("isLookupOpen:", isLookupOpen);

  const suggestions =
    searchTerm.trim() === ""
      ? suggestedProducts.slice(0, 3).map((product: IProduct) => ({
          name: product.name,
          id: product.id,
        }))
      : filteredProducts.slice(0, 3).map((product: IProduct) => ({
          name: product.name,
          id: product.slug || product.id,
        }));
  console.log("suggestions:", suggestions);

  return (
    <div className="w-6 h-6 relative">
      {isLookupOpen ? (
        <div className="absolute -top-2 right-0 w-[15.625rem] z-[999] shadow-lg rounded-full">
          <div className="bg-white z-[999] shadow-lg rounded-lg">
            <motion.div
              ref={inputRef}
              initial={{ width: "24px", opacity: 0, x: 226 }}
              animate={{ width: "15.625rem", opacity: 1, x: 0 }}
              exit={{ width: "24px", opacity: 0, x: 226 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
            >
              <SearchInput
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                setIsOpen={setIsLookupOpen}
                isMobile={false}
              />
            </motion.div>
            <motion.div
              ref={menuRef}
              className="text-black w-full max-h-96 overflow-hidden flex flex-col z-[40]"
              initial={{ y: "-8%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "-8%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
            >
              <div className="flex-1 overflow-y-auto px-2 py-4">
                {isSuggestedLoading || isLoading ? (
                  <div className="sk-chase" role="status" aria-label="Đang tải">
                    <div className="sk-chase-dot"></div>
                    <div className="sk-chase-dot"></div>
                    <div className="sk-chase-dot"></div>
                    <div className="sk-chase-dot"></div>
                    <div className="sk-chase-dot"></div>
                    <div className="sk-chase-dot"></div>
                  </div>
                ) : suggestedError && suggestedProducts.length === 0 ? (
                  <p className="text-center text-red-500">Lỗi: {suggestedError}</p>
                ) : searchTerm.trim() !== "" && filteredProducts.length === 0 ? (
                  <p className="text-center text-gray-500">Không tìm thấy sản phẩm</p>
                ) : (
                  <div className="flex flex-col gap-6">
                    {searchTerm.trim() === "" ? (
                      <SearchSuggestions
                        suggestions={suggestions}
                        onClick={(suggestion) => {
                          setIsLookupOpen(false);
                        }}
                      />
                    ) : (
                      <SearchResults
                        filteredProducts={filteredProducts}
                        searchTerm={searchTerm}
                        isMobile={false}
                        products={filteredProducts}
                        onResultClick={handleResultClick}
                      />
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          ref={lookupButtonRef}
          className="text-gray-400 hover:text-black absolute top-0 right-0 w-6 h-6"
          onClick={() => setIsLookupOpen(true)}
          aria-label="Mở tìm kiếm"
          aria-expanded={isLookupOpen}
        >
          <Image
            src="/nav/nav_lookup.svg"
            alt="Tìm kiếm"
            width={24}
            height={24}
            className="h-6 w-auto"
          />
        </button>
      )}
    </div>
  );
}