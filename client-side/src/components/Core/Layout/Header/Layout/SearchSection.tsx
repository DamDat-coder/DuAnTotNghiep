"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useLookup } from "@/contexts/LookupContext";
import { fetchProductBySlug } from "@/services/productApi";
import { IProduct } from "@/types/product";
import { motion } from "framer-motion";
import { debounce } from "lodash";
import SearchInput from "../LookupMenu/SearchInput";
import SearchSuggestions from "../LookupMenu/SearchSuggestions";
import SearchResults from "../LookupMenu/SearchResults";
import { useSuggestions } from "@/contexts/SuggestionsContext";
import { convertToSlug } from "@/utils/slugify";

export default function SearchSection() {
  const { isLookupOpen, setIsLookupOpen } = useLookup();
  const { defaultSuggestions } = useSuggestions(); // ✅ Đã lấy suggestion từ context
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<IProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const lookupButtonRef = useRef<HTMLButtonElement>(null);

  const debouncedSearch = debounce(async (term: string) => {
    if (term.trim() === "") {
      setFilteredProducts([]);
      return;
    }
    try {
      setIsLoading(true);
      const slug = convertToSlug(term); // ✅ dùng term ở đây, không dùng searchTerm để tránh stale value
      const result = await fetchProductBySlug(slug, false);
      setFilteredProducts(
        Array.isArray(result) ? result : result ? [result] : []
      );
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

  const suggestions =
    searchTerm.trim() === ""
      ? defaultSuggestions
      : filteredProducts.slice(0, 3).map((product) => ({
          name: product.name,
          id: product.slug || product.id,
        }));

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
                {isLoading ? (
                  <div className="sk-chase" role="status" aria-label="Đang tải">
                    <div className="sk-chase-dot"></div>
                    <div className="sk-chase-dot"></div>
                    <div className="sk-chase-dot"></div>
                    <div className="sk-chase-dot"></div>
                    <div className="sk-chase-dot"></div>
                    <div className="sk-chase-dot"></div>
                  </div>
                ) : searchTerm.trim() !== "" &&
                  filteredProducts.length === 0 ? (
                  <p className="text-center text-gray-500">
                    Không tìm thấy sản phẩm
                  </p>
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
