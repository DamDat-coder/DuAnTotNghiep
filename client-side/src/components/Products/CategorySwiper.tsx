"use client";

import { useSearchParams } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import Link from "next/link";
import "swiper/css";

interface Category {
  _id: string;
  name: string;
}

interface CategorySwiperProps {
  categories: Category[];
}

export default function CategorySwiper({ categories }: CategorySwiperProps) {
  const searchParams = useSearchParams();
  const currentIdCate = searchParams.get("id_cate");

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
            !currentIdCate ? "text-black font-bold" : "text-gray-700"
          }`}
        >
          Tất cả
        </Link>
      </SwiperSlide>

      {categories.map((category) => {
        const isActive = currentIdCate === category._id;

        return (
          <SwiperSlide key={category._id} className="!w-auto">
            <Link
              href={`/products?id_cate=${encodeURIComponent(category._id)}`}
              className={`text-base hover:text-black ${
                isActive ? "text-black font-bold" : "text-gray-700"
              }`}
            >
              {category.name}
            </Link>
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
}
