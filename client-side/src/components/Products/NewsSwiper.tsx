// src/components/NewsSwiper.tsx
"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import "swiper/css";

interface News {
  id: string;
  img: string;
  newsCategory: string;
  name: string;
  benefit?: string;
}

interface NewsSwiperProps {
  newsItems: News[];
}

export default function NewsSwiper({ newsItems }: NewsSwiperProps) {
  return (
    <Swiper
      spaceBetween={16}
      slidesPerView={1}
      loop={false}
      grabCursor={true}
      className="select-none w-full"
    >
      {newsItems.map((news) => (
        <SwiperSlide key={news.id} className="!w-[240px]">
          <div className="flex flex-col items-start gap-3">
            <Image
              src={`/memberBenefit/${news.img}`}
              alt={news.name || "Tin tức"}
              width={240}
              height={136}
              className="w-[240px] h-[136px] object-cover rounded select-none"
              draggable={false}
            />
            <div className="flex flex-col gap-1">
              <div className="text-base text-gray-700">{news.newsCategory}</div>
              <div className="text-[1.25rem] font-bold text-gray-700 leading-[1.5rem] line-clamp-2">
                {news.name}
              </div>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}