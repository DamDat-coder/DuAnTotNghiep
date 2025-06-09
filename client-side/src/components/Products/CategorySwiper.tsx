"use client";

import { useSearchParams } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import Link from "next/link";
import "swiper/css";

interface CategorySwiperProps {
  categories: string[];
}

export default function CategorySwiper({ categories }: CategorySwiperProps) {
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");

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
      <SwiperSlide className="!w-auto">
        <Link
          href={`/products`}
          className={`text-base hover:text-black ${
            !currentCategory ? "text-black font-bold" : "text-gray-700"
          }`}
        >
          Tất cả
        </Link>
      </SwiperSlide>

      {categories.map((category, index) => {
        const isActive = currentCategory === category.toLowerCase();

        return (
          <SwiperSlide key={index} className="!w-auto">
            <Link
              href={`/products?category=${category.toLowerCase()}`}
              className={`text-base hover:text-black ${
                isActive ? "text-black font-bold" : "text-gray-700"
              }`}
            >
              {category}
            </Link>
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
}
