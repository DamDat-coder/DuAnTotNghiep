// src/components/NewsSwiper.tsx
"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import "swiper/css";
import { News } from "@/types/new";

interface NewsSwiperProps {
  newsItems: News[];
  mobileSlidesPerView?: number;
  tabletSlidesPerView?: number;
}

export default function NewsSwiper({
  newsItems,
  mobileSlidesPerView = 1.2,
  tabletSlidesPerView = 2.5,
}: NewsSwiperProps) {
  return (
    <Swiper
      spaceBetween={16}
      loop={false}
      grabCursor={true}
      className="select-none w-full"
      breakpoints={{
        0: {
          slidesPerView: mobileSlidesPerView,
        },
        768: {
          slidesPerView: tabletSlidesPerView,
        },
      }}
    >
      {newsItems.map((news) => (
        <SwiperSlide key={news._id || news.id} className="!w-[240px]">
          <div className="flex flex-col items-start gap-3">
            <Image
              src={news.thumbnail || "/placeholder-image.jpg"}
              alt={news.title || "Tin tức"}
              width={240}
              height={136}
              className="w-[240px] h-[136px] object-cover rounded select-none"
              draggable={false}
            />
            <div className="flex flex-col gap-1">
              <div className="text-base text-gray-700">
                {news.category_id?.name || "Không rõ danh mục"}
              </div>
              <div className="text-[1.25rem] font-bold text-gray-700 leading-[1.5rem] line-clamp-2">
                {news.title}
              </div>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
