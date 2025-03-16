"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Product } from "../types";
import "swiper/css";

interface FeaturedSectionProps {
  products: Product[];
}

export default function FeaturedSection({ products }: FeaturedSectionProps) {
  if (!products || products.length === 0) {
    return (
      <div className="featured max-w-md mx-auto tablet:max-w-2xl desktop:max-w-4xl py-4"> {/* Xóa px-6 */}
        <p className="text-center text-gray-500">
          Không có sản phẩm nào để hiển thị.
        </p>
      </div>
    );
  }

  return (
    <div className="featured max-w-md mx-auto tablet:max-w-2xl desktop:max-w-4xl">
      <h1 className="text-[1.5rem] pb-6 font-bold">Mua Sắm Theo Giới Tính</h1> {/* Xóa px-6 */}
      <Swiper
        spaceBetween={16}
        slidesPerView={1.5}
        loop={false}
        grabCursor={true}
        className="select-none" // Xóa px-6
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
                {product.category || "Danh mục"}
              </button>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}