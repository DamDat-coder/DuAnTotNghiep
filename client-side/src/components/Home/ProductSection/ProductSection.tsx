"use client";

import React, { useEffect, useRef, useState } from "react";
import { IProduct } from "@/types/product";
import { useAuth } from "@/contexts/AuthContext";
import BuyNowPopup from "../../Core/Layout/BuyNowButton/BuyNowPopup";
import AddToCartPopup from "../../Cart/AddToCartPopup";
import ProductCard from "./ProductCard";
import ProductSwiper from "./ProductSwiper";

interface ProductSectionProps {
  products: { data: IProduct[] } | IProduct[];
  desktopSlidesPerView?: number;
  laptopSlidesPerView?: number;
  tabletSlidesPerView?: number;
  showLoadMore?: boolean;
}

export default function ProductSection({
  products,
  desktopSlidesPerView = 4.2,
  laptopSlidesPerView = 3.2,
  tabletSlidesPerView = 2.2,
  showLoadMore = true,
}: ProductSectionProps) {
  const productList = Array.isArray(products) ? products : products.data || [];
  const PRODUCTS_PER_PAGE = 5;

  const [displayedProducts, setDisplayedProducts] = useState<IProduct[]>(
    productList.slice(0, PRODUCTS_PER_PAGE)
  );
  const [hasMore, setHasMore] = useState(productList.length > PRODUCTS_PER_PAGE);
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const observerRef = useRef<HTMLDivElement | null>(null);

  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [isBuyNowPopupOpen, setIsBuyNowPopupOpen] = useState(false);
  const [isAddToCartPopupOpen, setIsAddToCartPopupOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!showLoadMore || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          loadMoreProducts();
        }
      },
      { rootMargin: "600px" }
    );

    const currentRef = observerRef.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [displayedProducts, hasMore, loading, showLoadMore]);

  const loadMoreProducts = () => {
    setLoading(true);
    const currentLength = displayedProducts.length;
    const nextProducts = productList.slice(
      currentLength,
      currentLength + PRODUCTS_PER_PAGE
    );

    setDisplayedProducts((prev) => [...prev, ...nextProducts]);
    setHasMore(currentLength + nextProducts.length < productList.length);
    setLoading(false);
  };

  const handleBuyNow = (product: IProduct, e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedProduct(product);
    setIsBuyNowPopupOpen(true);
  };

  const handleAddToCart = (product: IProduct, e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedProduct(product);
    setIsAddToCartPopupOpen(true);
  };

  if (!productList || productList.length === 0) {
    return (
      <div>
        <p className="text-center text-gray-500">
          Không có sản phẩm nào để hiển thị.
        </p>
      </div>
    );
  }

  return (
    <div role="region" aria-label="Danh sách sản phẩm mới nhất">
      <h1 className="text-[1.5rem] pb-6 font-heading font-bold">
        Mới Nhất & Tốt Nhất
      </h1>

      {isClient ? (
        <>
          {/* Mobile */}
          <div className="block tablet:hidden">
            <ProductSwiper
              products={displayedProducts}
              slidesPerView={1.5}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
            />
          </div>

          {/* Tablet */}
          <div className="hidden tablet:block laptop:hidden">
            <ProductSwiper
              products={displayedProducts}
              slidesPerView={tabletSlidesPerView}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
            />
          </div>

          {/* Laptop */}
          <div className="hidden laptop:block desktop:hidden">
            <ProductSwiper
              products={displayedProducts}
              slidesPerView={laptopSlidesPerView}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
            />
          </div>

          {/* Desktop */}
          <div className="hidden desktop:block">
            <ProductSwiper
              products={displayedProducts}
              slidesPerView={desktopSlidesPerView}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
            />
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-3 desktop:grid-cols-4 gap-4">
          {displayedProducts.map((product, index) => (
            <ProductCard
              key={product.id || index}
              product={product}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
            />
          ))}
        </div>
      )}

      {showLoadMore && hasMore && (
        <div ref={observerRef} className="h-10" aria-hidden="true" />
      )}
      {loading && (
        <div className="text-center text-gray-500">Đang tải thêm...</div>
      )}

      {selectedProduct && (
        <>
          <BuyNowPopup
            product={selectedProduct}
            isOpen={isBuyNowPopupOpen}
            onClose={() => {
              setIsBuyNowPopupOpen(false);
              setSelectedProduct(null);
            }}
          />
          <AddToCartPopup
            product={selectedProduct}
            isOpen={isAddToCartPopupOpen}
            onClose={() => {
              setIsAddToCartPopupOpen(false);
              setSelectedProduct(null);
            }}
          />
        </>
      )}
    </div>
  );
}
