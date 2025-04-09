// src/components/FeaturedSwiper.tsx
"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { IFeaturedProducts } from "@/types";

interface FeaturedSwiperProps {
  featuredSection: IFeaturedProducts[];
}

export default function FeaturedSwiper({ featuredSection }: FeaturedSwiperProps) {
  return (
    <Swiper
      spaceBetween={16}
      slidesPerView={1.5}
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
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}