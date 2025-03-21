// src/components/FeaturedSection.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Product } from "../types";
import "swiper/css";

interface FeaturedSectionProps {
  products: Product[];
}

export default function FeaturedSection({ products }: FeaturedSectionProps) {
  const [slidesPerView, setSlidesPerView] = useState(1.5); // Giá trị mặc định

  useEffect(() => {
    // Cập nhật slidesPerView dựa trên kích thước màn hình
    const handleResize = () => {
      if (typeof window !== "undefined") {
        setSlidesPerView(window.innerWidth >= 1920 ? 3.5 : 1.5);
      }
    };

    // Gọi lần đầu khi mount
    handleResize();

    // Lắng nghe sự kiện resize
    window.addEventListener("resize", handleResize);

    // Cleanup khi unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!products || products.length === 0) {
    return (
      <div className="featured w-full mx-auto max-w-md tablet:max-w-2xl desktop:w-[90%] desktop:max-w-[2560px] py-4">
        <p className="text-center text-gray-500">
          Không có sản phẩm nào để hiển thị.
        </p>
      </div>
    );
  }

  return (
    <div className="featured w-full mx-auto max-w-md tablet:max-w-2xl desktop:w-[90%] desktop:max-w-[2560px]">
      <h1 className="text-[1.5rem] pb-6 font-bold">Mua Sắm Theo Giới Tính</h1>
      <Swiper
        spaceBetween={typeof window !== "undefined" && window.innerWidth >= 1920 ? 109 : 16}
        slidesPerView={slidesPerView}
        loop={false}
        grabCursor={true}
        className="select-none"
        wrapperClass="swiper-wrapper"
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
                Shop {product.category || "Danh mục"}
              </button>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}