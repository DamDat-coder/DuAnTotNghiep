"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import FilterPopup from "../Filter/FilterPopup";
import BuyNowPopup from "../../Core/Layout/BuyNowButton/BuyNowPopup";
import { IProduct, ProductGridProps } from "@/types/product";
import { SortOption } from "@/types/filter";
import ProductCardWithWishlist from "./ProductCardWithWishlist";

export default function ProductGrid({
  products,
  onApplyFilters,
}: ProductGridProps) {
  // Các state quản lý hiển thị sản phẩm
  const [displayedProducts, setDisplayedProducts] = useState<IProduct[]>(products.slice(0, 8));
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(products.length > 8);

  // State cho popup "Mua ngay"
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);

  // State cho popup bộ lọc
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const searchParams = useSearchParams();
  const observerRef = useRef<HTMLDivElement | null>(null);

  // Danh sách sort hợp lệ
  const VALID_SORT_OPTIONS: SortOption[] = [
    "newest",
    "oldest",
    "price_asc",
    "price_desc",
    "best_selling",
  ];

  // Lấy bộ lọc từ query string
  const currentFilters = {
    id_cate: searchParams.get("id_cate") || undefined,
    sort_by: VALID_SORT_OPTIONS.includes(searchParams.get("sort_by") as SortOption)
      ? (searchParams.get("sort_by") as SortOption)
      : undefined,
    minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
    maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
    color: searchParams.get("color") || undefined,
    size: searchParams.get("size") || undefined,
  };

  const PRODUCTS_PER_PAGE = 8;

  // Reset khi products thay đổi
  useEffect(() => {
    setDisplayedProducts(products.slice(0, PRODUCTS_PER_PAGE));
    setHasMore(products.length > PRODUCTS_PER_PAGE);
  }, [products]);

  // Infinite scroll: gọi khi observer nhìn thấy đáy danh sách
  useEffect(() => {
    if (!hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          loadMoreProducts();
        }
      },
      { rootMargin: "100px" }
    );

    const currentRef = observerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, loading, displayedProducts]);

  // Hàm load thêm sản phẩm
  const loadMoreProducts = () => {
    setLoading(true);
    const currentLength = displayedProducts.length;
    const nextProducts = products.slice(currentLength, currentLength + PRODUCTS_PER_PAGE);

    setTimeout(() => {
      setDisplayedProducts((prev) => [...prev, ...nextProducts]);
      setHasMore(currentLength + nextProducts.length < products.length);
      setLoading(false);
    }, 600);
  };

  // Xử lý khi click "Mua ngay"
  const handleBuyNow = (product: IProduct, e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedProduct(product);
    setIsPopupOpen(true);
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <p className="desc-text text-[#B0B0B0]">{products.length} Sản phẩm</p>
        <button
          className="flex items-center gap-1 py-[0.625rem] px-[0.75rem] text-base font-bold rounded-full border-2"
          onClick={() => setIsFilterOpen(true)}
        >
          Lọc sản phẩm
          <Image src="/product/product_filter.svg" alt="filter" width={16} height={16} />
        </button>
      </div>

      <div className="grid grid-cols-2 tablet:grid-cols-3 gap-4 desktop:grid-cols-4 laptop:grid-cols-4 pt-2">
        {displayedProducts.map((product) => (
          <div key={product.id} className="w-full">
            <ProductCardWithWishlist product={product} onBuyNow={handleBuyNow} />
          </div>
        ))}
      </div>

      {/* Hiển thị nếu không có sản phẩm nào */}
      {products.length === 0 && (
        <div className="col-span-full text-center text-gray-500 py-10 w-full">
          Không tìm thấy sản phẩm phù hợp với bộ lọc hiện tại.
        </div>
      )}

      {/* Vùng trigger load thêm sản phẩm */}
      <div ref={observerRef} className={`h-10 ${!hasMore ? "hidden" : ""}`}>
        {loading && (
          <div className="sk-chase">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="sk-chase-dot"></div>
            ))}
          </div>
        )}
      </div>

      {/* Popup bộ lọc */}
      <FilterPopup
        isOpen={isFilterOpen}
        setIsOpen={setIsFilterOpen}
        onApplyFilters={onApplyFilters ?? (() => {})}
        currentFilters={currentFilters}
      />

      {/* Popup mua ngay */}
      {selectedProduct && (
        <BuyNowPopup
          product={selectedProduct}
          isOpen={isPopupOpen}
          onClose={() => {
            setIsPopupOpen(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </>
  );
}
