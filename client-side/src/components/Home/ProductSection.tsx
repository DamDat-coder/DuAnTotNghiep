// src/components/Home/ProductSection.tsx
"use client";

import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import "swiper/css";
import { IProduct } from "@/types/product";
import AddToCartButton from "../Cart/AddToCartButton";
import BuyNowPopup from "../Core/Layout/BuyNowButton/BuyNowPopup";

interface ProductSectionProps {
  products: { data: IProduct[] } | IProduct[];
  desktopSlidesPerView?: number;
  tabletSlidesPerView?: number;
  showLoadMore?: boolean;
}

export default function ProductSection({
  products,
  desktopSlidesPerView = 4.5,
  tabletSlidesPerView = 2.5,
  showLoadMore = true,
}: ProductSectionProps) {
  const productList = Array.isArray(products) ? products : products.data || [];
  const [displayedProducts, setDisplayedProducts] = useState<IProduct[]>(
    productList.slice(0, 5)
  );
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(productList.length > 5);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const PRODUCTS_PER_PAGE = 5;
  const [isClient, setIsClient] = useState(false);

  // Xác định khi đang ở client-side, tránh xung đột hydration
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
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, loading, displayedProducts, showLoadMore]);

  const loadMoreProducts = () => {
    setLoading(true);
    const currentLength = displayedProducts.length;
    const nextProducts = productList.slice(
      currentLength,
      currentLength + PRODUCTS_PER_PAGE
    );

    setTimeout(() => {
      setDisplayedProducts((prev) => [...prev, ...nextProducts]);
      const newLength = currentLength + nextProducts.length;
      setHasMore(newLength < productList.length);
      setLoading(false);
    }, 500);
  };

  const handleBuyNow = (product: IProduct, e: React.MouseEvent) => {
    e.preventDefault(); // Ngăn Link điều hướng
    setSelectedProduct(product);
    setIsPopupOpen(true);
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

  const renderProductCard = (product: IProduct) => {
    const discountPrice = product.price * (1 - product.discountPercent / 100);

    return (
      <div className="w-full flex flex-col bg-white relative">
        <div className="product w-full h-auto">
          <Image
            src={`/product/img/${product.images[0]}`}
            alt={product.name || "Sản phẩm"}
            width={363}
            height={363}
            className="w-full h-[16.8125rem] laptop:h-[18.3125rem] desktop:h-[18.3125rem] object-cover"
            draggable={false}
          />
          <div className="absolute top-[0.5rem] left-[0.5rem] bg-red-500 text-white text-[0.75rem] font-bold px-2 py-1 rounded font-description">
            -{product.discountPercent}%
          </div>
          <AddToCartButton product={product} />
          <div className="content flex flex-col p-4">
            <div className="name text-base tablet:text-lg laptop:text-lg desktop:text-lg font-bold text-[#374151] pb-2 truncate font-description">
              {product.name || "Sản phẩm"}
            </div>
            <div className="category text-base text-[#374151] truncate font-description">
              {product.category || "Danh mục"}
            </div>
            <div className="price-container flex items-center gap-3 pt-2 font-description">
              <div className="discountPrice text-[1rem] font-bold text-red-500">
                {discountPrice.toLocaleString("vi-VN")}₫
              </div>
              <div className="price text-[0.875rem] text-[#374151] line-through">
                {product.price.toLocaleString("vi-VN")}₫
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/products/${product.id}`}
              className="p-3 border-solid border-black border-2 rounded text-base"
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
    );
  };

  return (
    <div>
      <h1 className="text-[1.5rem] pb-6 font-heading font-bold">
        Mới Nhất & Tốt Nhất
      </h1>

      {/* Mobile: Swiper */}
      <div className="block tablet:hidden overflow-x-hidden">
        {isClient && (
          <Swiper
            spaceBetween={10}
            slidesPerView={1.5}
            loop={false}
            grabCursor={true}
            className="select-none"
          >
            {displayedProducts.map((product, index) => (
              <SwiperSlide
                key={product.id || `product-${index}`}
                className="!w-[16.8125rem]"
              >
                {renderProductCard(product)}
              </SwiperSlide>
            ))}
          </Swiper>
        )}
        {!isClient && (
          <div className="flex gap-2 overflow-x-auto">
            {displayedProducts.map((product, index) => (
              <div
                key={product.id || `product-${index}`}
                className="w-[16.8125rem] flex-shrink-0"
              >
                {renderProductCard(product)}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tablet: Swiper */}
      <div className="hidden tablet:block laptop:hidden desktop:hidden">
        {isClient && (
          <Swiper
            spaceBetween={20}
            slidesPerView={tabletSlidesPerView}
            loop={false}
            grabCursor={true}
            className="select-none"
          >
            {displayedProducts.map((product, index) => (
              <SwiperSlide key={product.id || `product-${index}`}>
                {renderProductCard(product)}
              </SwiperSlide>
            ))}
          </Swiper>
        )}
        {!isClient && (
          <div className="grid grid-cols-2 gap-4">
            {displayedProducts.map((product, index) => (
              <div key={product.id || `product-${index}`}>
                {renderProductCard(product)}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop: Swiper */}
      <div className="hidden laptop:hidden desktop:block">
        {isClient && (
          <Swiper
            spaceBetween={20}
            slidesPerView={desktopSlidesPerView}
            loop={false}
            grabCursor={true}
            className="select-none"
          >
            {displayedProducts.map((product, index) => (
              <SwiperSlide key={product.id || `product-${index}`}>
                {renderProductCard(product)}
              </SwiperSlide>
            ))}
          </Swiper>
        )}
        {!isClient && (
          <div className="grid grid-cols-4 gap-4">
            {displayedProducts.map((product, index) => (
              <div key={product.id || `product-${index}`}>
                {renderProductCard(product)}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Laptop: Swiper */}
      <div className="hidden desktop:hidden laptop:block">
        {isClient && (
          <Swiper
            spaceBetween={20}
            slidesPerView={desktopSlidesPerView}
            loop={false}
            grabCursor={true}
            className="select-none"
          >
            {displayedProducts.map((product, index) => (
              <SwiperSlide
                key={product.id || `product-${index}`}
                className="w-100%"
              >
                {renderProductCard(product)}
              </SwiperSlide>
            ))}
          </Swiper>
        )}
        {!isClient && (
          <div className="grid grid-cols-4 gap-4">
            {displayedProducts.map((product, index) => (
              <div key={product.id || `product-${index}`}>
                {renderProductCard(product)}
              </div>
            ))}
          </div>
        )}
      </div>

      {showLoadMore && hasMore && <div ref={observerRef} className="h-10" />}

      {/* Một BuyNowPopup duy nhất */}
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
    </div>
  );
}
