// src/components/ProductSection.tsx
"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Product } from "../types";
import "swiper/css";

interface ProductSectionProps {
  products: Product[];
}

export default function ProductSection({ products }: ProductSectionProps) {
  if (!products || products.length === 0) {
    return (
      <div className="max-w-md mx-auto tablet:max-w-2xl desktop:max-w-4xl px-6 py-4">
        <p className="text-center text-gray-500">
          Không có sản phẩm nào để hiển thị.
        </p>
      </div>
    );
  }

  const renderProductCard = (product: Product) => {
    const discountPrice = product.price * (1 - product.discountPercent / 100);

    return (
      <div className="product w-[16.8125rem] h-[23.875rem] flex flex-col bg-white shadow-xl">
        <img
          src={`/featured/${product.image}`}
          alt={product.name || "Sản phẩm"}
          className="w-[16.8125rem] h-[16.8125rem] object-cover"
          draggable="false"
        />
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
    );
  };

  return (
    <div className="max-w-md mx-auto tablet:max-w-2xl desktop:max-w-4xl px-6 py-4">
      <h1 className="text-[1.5rem] font-bold">Mới Nhất & Tốt Nhất</h1>

      {/* Mobile: Swiper Slider */}
      <div className="block tablet:hidden">
        <Swiper
          spaceBetween={10}
          slidesPerView={1.2}
          loop={false}
          grabCursor={true}
          className="select-none"
        >
          {products.map((product) => (
            <SwiperSlide key={product.id} className="!m-0">
              {renderProductCard(product)}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Tablet & Desktop: Grid */}
      <div className="hidden tablet:grid tablet:grid-cols-2 desktop:grid-cols-3 gap-[10px]">
        {products.map((product) => (
          <div key={product.id} className="m-0">
            {renderProductCard(product)}
          </div>
        ))}
      </div>
    </div>
  );
}
