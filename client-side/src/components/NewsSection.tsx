"use client";

import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import { fetchMemberBenefits } from "../services/api";
import "swiper/css";

interface News {
  id: string;
  img: string;
  newsCategory: string;
  name: string;
  benefit?: string;
}

export default function NewsSection() {
  const [newsItems, setNewsItems] = useState<News[]>([]);

  useEffect(() => {
    async function loadNews() {
      const memberBenefits = await fetchMemberBenefits();
      const newsData: News[] = memberBenefits.map((item, index) => ({
        ...item,
        img: item.image,
        newsCategory: ["Khuyến Mãi", "Dịch Vụ", "Sự Kiện"][index],
        name: ["Ưu đãi tháng 3", "Giao hàng miễn phí 2025", "Quà tặng đặc biệt"][index],
      }));
      setNewsItems(newsData);
    }
    loadNews();
  }, []);

  if (!newsItems.length) {
    return (
      <div className="max-w-md mx-auto tablet:max-w-2xl desktop:w-[80%] desktop:max-w-[2560px] py-4">
        <p className="text-center text-gray-500">Không có tin tức nào để hiển thị.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto tablet:max-w-2xl desktop:w-[80%] desktop:max-w-[2560px]">
      <h1 className="text-[1.5rem] pb-6 font-bold">Tin Tức Mới Nhất</h1>
      <Swiper
        spaceBetween={16} // 16px = 1rem
        slidesPerView={1} // Mobile: 1 slide
        loop={false}
        grabCursor={true}
        className="select-none w-full" // Full width container
        breakpoints={{
          768: { slidesPerView: 2 }, // Tablet: 2 slide
          1024: { slidesPerView: 3 }, // Desktop: 3 slide
        }}
      >
        {newsItems.map((news) => (
          <SwiperSlide key={news.id} className="!w-[240px] desktop:!w-[380px]">
            <div className="flex flex-col items-start gap-3">
              <Image
                src={`/memberBenefit/${news.img}`}
                alt={news.name}
                width={240}
                height={136}
                className="w-[240px] h-[136px] desktop:w-[380px] desktop:h-[214px] object-cover rounded select-none"
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
    </div>
  );
}