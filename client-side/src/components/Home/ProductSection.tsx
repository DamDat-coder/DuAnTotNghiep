"use client";

import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import "swiper/css";
import { IProduct } from "@/types/product";
import AddToCartButton from "../Cart/AddToCartButton";
import AddToCartPopup from "../Cart/AddToCartPopup"; // Import mới
import BuyNowPopup from "../Core/Layout/BuyNowButton/BuyNowPopup";
import { useAuth } from "@/contexts/AuthContext";

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
  const [displayedProducts, setDisplayedProducts] = useState<IProduct[]>(
    productList.slice(0, 5)
  );
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(productList.length > 5);
  const [isBuyNowPopupOpen, setIsBuyNowPopupOpen] = useState(false);
  const [isAddToCartPopupOpen, setIsAddToCartPopupOpen] = useState(false); // State mới
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const PRODUCTS_PER_PAGE = 5;
  const [isClient, setIsClient] = useState(false);
  const { user } = useAuth();

  // Xác định client-side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Lazy loading với IntersectionObserver
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
  }, [hasMore, loading, displayedProducts, showLoadMore]);

  const loadMoreProducts = () => {
    setLoading(true);
    const currentLength = displayedProducts.length;
    const nextProducts = productList.slice(
      currentLength,
      currentLength + PRODUCTS_PER_PAGE
    );

    setDisplayedProducts((prev) => [...prev, ...nextProducts]);
    const newLength = currentLength + nextProducts.length;
    setHasMore(newLength < productList.length);
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

  // Hàm tìm variant có giá thấp nhất
  const getLowestPriceVariant = (
    variants: IProduct["variants"]
  ): { price: number; discountPercent: number } => {
    if (!variants || variants.length === 0) {
      return { price: 0, discountPercent: 0 };
    }
    return variants.reduce((lowest, variant) => {
      return variant.price < lowest.price ? variant : lowest;
    }, variants[0]);
  };

  const renderProductCard = (product: IProduct) => {
    const { price, discountPercent } = getLowestPriceVariant(product.variants);
    const discountPrice = Math.round(price * (1 - discountPercent / 100));
    return (
      <div className="w-full flex flex-col bg-white relative">
        <div className="product w-full h-auto font-description">
          <Image
            src={product.images[0]}
            alt={product.name || "Sản phẩm"}
            width={200}
            height={200}
            className="w-full h-[16.8125rem] laptop:h-[18.3125rem] desktop:h-[18.3125rem] object-cover rounded"
            draggable={false}
          />
          {discountPercent > 0 && (
            <div className="absolute top-[0.5rem] left-[0.5rem] bg-red-500 text-white text-[0.75rem] font-bold px-2 py-1 rounded">
              -{discountPercent}%
            </div>
          )}
          <AddToCartButton onClick={(e: React.MouseEvent) => handleAddToCart(product, e)} />
          <div className="content flex flex-col py-4 gap-3">
            <div>
              <div className="name text-base tablet:text-lg laptop:text-lg desktop:text-lg font-bold text-[#374151] pb-2 two-line-clamp h-[3rem] tablet:h-[3.5rem] laptop:h-[3.5rem] desktop:h-[3.5rem]">
                {product.name || "Sản phẩm"}
              </div>
              <div className="category text-base text-[#374151] truncate">
                {product.category?.name || "Danh mục"}
              </div>
            </div>
            <div className="price-container flex items-center gap-3">
              <div className="discountPrice text-[1rem] font-bold text-red-500">
                {discountPrice.toLocaleString("vi-VN")}₫
              </div>
              {discountPercent > 0 && (
                <div className="price text-[0.875rem] text-[#374151] line-through">
                  {price.toLocaleString("vi-VN")}₫
                </div>
              )}
            </div>
            <div className="flex gap-3 font-heading">
              <Link
                href={`/products/${product.id}`}
                className="p-3 border-solid border-black border-2 rounded text-base"
                aria-label={`Xem chi tiết sản phẩm ${product.name}`}
              >
                Xem chi tiết
              </Link>
              <button
                onClick={(e) => handleBuyNow(product, e)}
                className="p-3 border-solid border-black border-2 rounded text-white bg-black font-bold text-base"
                aria-label={`Mua ngay sản phẩm ${product.name}`}
              >
                Mua ngay
              </button>
            </div>
          </div>
        </div>
      </div>
    );
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
              <Swiper
                spaceBetween={10}
                slidesPerView={1.5}
                loop={false}
                grabCursor={true}
                className="select-none"
                role="list"
              >
                {displayedProducts.map((product, index) => (
                  <SwiperSlide
                    key={product.id || `product-${index}`}
                    className="!w-[16.8125rem]"
                    role="listitem"
                  >
                    {renderProductCard(product)}
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* Tablet */}
            <div className="hidden tablet:block laptop:hidden">
              <Swiper
                spaceBetween={20}
                slidesPerView={tabletSlidesPerView}
                loop={false}
                grabCursor={true}
                className="select-none"
                role="list"
              >
                {displayedProducts.map((product, index) => (
                  <SwiperSlide
                    key={product.id || `product-${index}`}
                    role="listitem"
                  >
                    {renderProductCard(product)}
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* Laptop */}
            <div className="hidden laptop:block desktop:hidden">
              <Swiper
                spaceBetween={20}
                slidesPerView={laptopSlidesPerView}
                loop={false}
                grabCursor={true}
                className="select-none"
                role="list"
              >
                {displayedProducts.map((product, index) => (
                  <SwiperSlide
                    key={product.id || `product-${index}`}
                    role="listitem"
                  >
                    {renderProductCard(product)}
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* Desktop */}
            <div className="hidden desktop:block">
              <Swiper
                spaceBetween={20}
                slidesPerView={desktopSlidesPerView}
                loop={false}
                grabCursor={true}
                className="select-none"
                role="list"
              >
                {displayedProducts.map((product, index) => (
                  <SwiperSlide
                    key={product.id || `product-${index}`}
                    role="listitem"
                  >
                    {renderProductCard(product)}
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-3 desktop:grid-cols-4 gap-4">
            {displayedProducts.map((product, index) => (
              <div key={product.id || `product-${index}`} role="listitem">
                {renderProductCard(product)}
              </div>
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