// src/components/FeaturedSection.tsx
"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Product } from "../types";
import "swiper/css"; // CSS cơ bản của Swiper

interface FeaturedSectionProps {
  products: Product[];
}

export default function FeaturedSection({ products }: FeaturedSectionProps) {
  if (!products || products.length === 0) {
    return (
      <div className="featured max-w-md mx-auto tablet:max-w-2xl desktop:max-w-4xl px-6 py-4">
        <p className="text-center text-gray-500">
          Không có sản phẩm nào để hiển thị.
        </p>
      </div>
    );
  }

  return (
    <div className="featured max-w-md mx-auto tablet:max-w-2xl desktop:max-w-4xl">
      <h1 className="text-[1.5rem] pb-6 font-bold px-6">Mua Sắm Theo Giới Tính</h1>
      <Swiper
        spaceBetween={16} // Tương đương slideGap
        slidesPerView={1.5} // Hiển thị 1.5 slide mỗi lần
        loop={false} // Không quay vòng
        grabCursor={true} // Hiển thị con trỏ kéo
        className="select-none px-6"
        wrapperClass="swiper-wrapper" // Đảm bảo wrapper có class đúng
      >
        {products.map((product) => (
          <SwiperSlide key={product.id}>
            <div className="flex flex-col items-start gap-5">
              <img
                src={`/featured/${product.banner}`}
                alt={`Featured ${product.name || "Sản phẩm"}`}
                className="w-full h-[25.625rem] object-cover rounded select-none tablet:h-80 desktop:h-96"
                draggable="false"
              />
              <button className="featured_action px-[0.7475rem] py-[0.52875rem] text-[1rem] leading-none bg-black text-white font-bold rounded-full hover:opacity-70 transition-colors">
                {product.category || "Danh mục"}
              </button>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}