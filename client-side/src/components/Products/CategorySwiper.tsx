// src/components/CategorySwiper.tsx
"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import Link from "next/link";
import "swiper/css";

interface CategorySwiperProps {
  categories: string[];
}

export default function CategorySwiper({ categories }: CategorySwiperProps) {
  return (
    <Swiper
      spaceBetween={16}
      slidesPerView={3.5}
      breakpoints={{
        768: { slidesPerView: 5 },
        1024: { slidesPerView: 7 },
        1920: { slidesPerView: 9 },
      }}
      loop={false}
      grabCursor={true}
      className="select-none my-4 border-b-2 border-[#D1D1D1] border-solid"
    >
      {categories.map((category, index) => (
        <SwiperSlide key={index} className="!w-auto">
          <Link
            href={`/products?category=${category.toLowerCase()}`}
            className="text-base text-gray-700 hover:text-black"
          >
            {category}
          </Link>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}   