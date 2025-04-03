// src/components/FeaturedSection.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FeaturedProducts } from "../types";
import "swiper/css"; // Import CSS của Swiper

interface FeaturedSectionProps {
  featuredSection: FeaturedProducts[];
}

export default function FeaturedSection({ featuredSection }: FeaturedSectionProps) {
  const [isMobile, setIsMobile] = useState(false);

  // Kiểm tra kích thước màn hình để quyết định dùng Swiper hay Grid
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined") {
        setIsMobile(window.innerWidth < 768); // Dưới 768px là mobile
      }
    };

    // Gọi lần đầu khi mount
    handleResize();

    // Lắng nghe sự kiện resize
    window.addEventListener("resize", handleResize);

    // Cleanup khi unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!featuredSection || featuredSection.length === 0) {
    return (
      <div className="featured w-full mx-auto max-w-md tablet:max-w-2xl desktop:w-[90%] desktop:max-w-[1920px] large:max-w-[2560px] py-4">
        <p className="text-center text-gray-500 font-body">
          Không có sản phẩm nào để hiển thị.
        </p>
      </div>
    );
  }

  return (
    <div className="featured w-full mx-auto max-w-md tablet:max-w-2xl desktop:w-full desktop:max-w-[1920px]  py-4">
      <h1 className="text-[1.5rem] pb-6 font-heading font-bold">
        Mua Sắm Theo Giới Tính
      </h1>

      {/* Hiển thị Swiper trên mobile, Grid trên tablet trở lên */}
      {isMobile ? (
        <Swiper
          spaceBetween={16} // Khoảng cách giữa các slide trên mobile
          slidesPerView={1.5} // Hiển thị 1.5 slide để có hiệu ứng preview
          loop={false}
          grabCursor={true}
          className="select-none"
          wrapperClass="swiper-wrapper"
        >
          {featuredSection.map((product) => (
            <SwiperSlide key={product.id}>
              <div className="flex flex-col items-start gap-5">
                <img
                  src={`/featured/${product.banner}`}
                  alt={`Featured ${product.gender || "Sản phẩm"}`}
                  className="w-auto h-[25.625rem] object-cover rounded select-none"
                  draggable="false"
                />
                <button className="featured_action px-[0.7475rem] py-[0.52875rem] text-[1rem] leading-none bg-black text-white font-body rounded-full hover:opacity-70 transition-colors">
                  Shop {product.gender || "Danh mục"}
                </button>
                <p className="font-description text-gray-600">
                  Mô tả sản phẩm: {product.gender || "Danh mục"}
                </p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-4 desktop:gap-8">
          {featuredSection.map((product) => (
            <div key={product.id} className="flex flex-col items-start gap-5">
              <img
                src={`/featured/${product.banner}`}
                alt={`Featured ${product.gender || "Sản phẩm"}`}
                className="w-auto h-[25.625rem] object-cover rounded select-none tablet:h-80 desktop:w-full desktop:h-auto desktop:object-contain"
                draggable="false"
              />
              <button className="featured_action px-[0.7475rem] py-[0.52875rem] text-[1rem] leading-none bg-black text-white font-body rounded-full hover:opacity-70 transition-colors">
                Shop {product.gender || "Danh mục"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}