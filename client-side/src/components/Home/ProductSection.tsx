// src/components/Home/ProductSection.tsx
"use client";

import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import "swiper/css";
import { IProduct } from "@/types";
import AddToCartButton from "../Cart/AddToCartButton";

interface ProductSectionProps {
  products: { data: IProduct[] } | IProduct[];
  desktopSlidesPerView?: number;
  showLoadMore?: boolean;
}

export default function ProductSection({
  products,
  desktopSlidesPerView = 4.5,
  showLoadMore = true,
}: ProductSectionProps) {
  const productList = Array.isArray(products) ? products : products.data || [];

  const [displayedProducts, setDisplayedProducts] = useState<IProduct[]>(
    productList.slice(0, 5)
  );
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(productList.length > 5);
  const observerRef = useRef<HTMLDivElement | null>(null);

  const PRODUCTS_PER_PAGE = 5;

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
      <Link
        href={`/products/${product.id}`}
        className=" w-full flex flex-col bg-white relative"
      >
        <div className="product w-full h-auto font-description">
          <Image
            src={`/product/img/${product.images[0]}`}
            alt={product.name || "Sản phẩm"}
            width={363}
            height={363}
            className="w-[16.8125rem] h-[16.8125rem] desktop:w-[22.6875rem] desktop:h-[22.6875rem] laptop:w-[22.6875rem] laptop:h-[22.6875rem] object-cover"
            draggable={false}
          />
          <div className="absolute top-[0.5rem] left-[0.5rem] bg-red-500 text-white text-[0.75rem] font-bold px-2 py-1 rounded">
            -{product.discountPercent}%
          </div>
          <AddToCartButton product={product} />
          <div className="content flex flex-col p-4">
            <div className="name text-lg font-bold text-[#374151] pb-2 truncate">
              {product.name || "Sản phẩm"}
            </div>
            <div className="category text-base text-[#374151] truncate">
              {product.category || "Danh mục"}
            </div>
            <div className="price-container flex items-center gap-3 pt-2">
              <div className="discountPrice text-[1rem] font-bold text-red-500">
                {discountPrice.toLocaleString("vi-VN")}₫
              </div>
              <div className="price text-[0.875rem] text-[#374151] line-through">
                {product.price.toLocaleString("vi-VN")}₫
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div>
      <h1 className="text-[1.5rem] pb-6 font-heading font-bold">
        Mới Nhất & Tốt Nhất
      </h1>

      {/* Mobile: Swiper */}
      <div className="block tablet:hidden overflow-x-hidden">
        <Swiper
          spaceBetween={10}
          slidesPerView={1.5}
          loop={false}
          grabCursor={true}
          className="select-none"
        >
          {displayedProducts.map((product, index) => (
            <SwiperSlide key={product.id || index} className="!w-[16.8125rem]">
              {renderProductCard(product)}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Tablet: Grid */}
      <div className="hidden laptop:hidden desktop:hidden tablet:grid tablet:grid-cols-2 gap-6">
        {displayedProducts.map((product, index) => (
          <div key={product.id || index}>{renderProductCard(product)}</div>
        ))}
      </div>

      {/* Desktop: Swiper */}
      <div className="hidden laptop:hidden desktop:block">
        <Swiper
          spaceBetween={20}
          slidesPerView={desktopSlidesPerView}
          loop={false}
          grabCursor={true}
          className="select-none"
        >
          {displayedProducts.map((product, index) => (
            <SwiperSlide key={product.id || index}>
              {renderProductCard(product)}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Laptop: Swiper */}
      <div className="hidden desktop:hidden laptop:block">
        <Swiper
          spaceBetween={20}
          slidesPerView={desktopSlidesPerView}
          loop={false}
          grabCursor={true}
          className="select-none"
        >
          {displayedProducts.map((product, index) => (
            <SwiperSlide className="w-100%" key={product.id || index}>
              {renderProductCard(product)}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {showLoadMore && hasMore && <div ref={observerRef} className="h-10" />}
    </div>
  );
}