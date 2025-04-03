// src/components/MemberBenefitsBanner.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { MemberBenefit } from "../types";
import { fetchMemberBenefits } from "../services/api";
import "swiper/css";

export default function MemberBenefitsBanner() {
  const [benefits, setBenefits] = useState<MemberBenefit[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [slidesPerView, setSlidesPerView] = useState(2.5); // Giá trị mặc định cho tablet/desktop

  useEffect(() => {
    // Fetch benefits
    async function loadBenefits() {
      const data = await fetchMemberBenefits();
      setBenefits(data);
    }
    loadBenefits();

    // Kiểm tra kích thước màn hình để quyết định dùng Grid hay Swiper
    const handleResize = () => {
      if (typeof window !== "undefined") {
        const width = window.innerWidth;
        setIsMobile(width < 768); // Dưới 768px là mobile
        setSlidesPerView(width >= 1920 ? 3 : width >= 768 ? 2.5 : 1.5); // SlidesPerView cho Swiper
      }
    };

    // Gọi lần đầu khi mount
    handleResize();

    // Lắng nghe sự kiện resize
    window.addEventListener("resize", handleResize);

    // Cleanup khi unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!benefits.length) {
    return (
      <div className="member-benefits w-full mx-auto max-w-md tablet:max-w-2xl desktop:w-full">
        <p className="text-center text-gray-500">
          Không có quyền lợi nào để hiển thị.
        </p>
      </div>
    );
  }

  return (
    <div className="member-benefits w-full mx-auto max-w-md tablet:max-w-2xl desktop:w-full desktop:max-w-[2560px] py-4">
      <h1 className="text-[1.5rem] pb-6 font-heading font-bold">
        Quyền Lợi Thành Viên
      </h1>

      {/* Hiển thị Grid trên mobile, Swiper trên tablet/desktop */}
      {isMobile ? (
        <div className="grid grid-cols-3 gap-4">
          {benefits.map((benefit) => (
            <div key={benefit.id} className="relative w-full h-full">
              <img
                src={`/memberBenefit/${benefit.image}`}
                alt={benefit.benefit}
                className="w-full h-[25.625rem] object-cover rounded select-none"
                draggable="false"
              />
              <div className="absolute inset-0 bg-black/45 rounded"></div>
              <div className="absolute bottom-[1.5rem] left-[1.5rem] w-[55%] flex flex-col gap-2">
                <div className="text-[1.5rem] font-heading font-bold text-white leading-[1.8125rem] flex flex-wrap">
                  {benefit.benefit}
                </div>
                <button className="text-[1rem] px-[0.7475rem] py-[0.52875rem] bg-black text-white font-body rounded-full hover:opacity-70 transition-colors w-fit">
                  Shop
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Swiper
          spaceBetween={
            typeof window !== "undefined" && window.innerWidth >= 1920
              ? 109
              : window.innerWidth >= 768
              ? 24
              : 16
          }
          slidesPerView={slidesPerView}
          loop={false}
          grabCursor={true}
          className="select-none"
        >
          {benefits.map((benefit) => (
            <SwiperSlide key={benefit.id}>
              <div className="relative w-full h-full">
                <img
                  src={`/memberBenefit/${benefit.image}`}
                  alt={benefit.benefit}
                  className="w-full h-[25.625rem] object-cover rounded select-none tablet:h-80 desktop:w-full desktop:h-auto"
                  draggable="false"
                />
                <div className="absolute inset-0 bg-black/45 rounded"></div>
                <div className="absolute bottom-[1.5rem] left-[1.5rem] w-[55%] flex flex-col gap-2">
                  <div className="text-[1.5rem] font-heading font-bold text-white tablet:text-2xl desktop:text-3xl leading-[1.8125rem] flex flex-wrap">
                    {benefit.benefit}
                  </div>
                  <button className="text-[1rem] px-[0.7475rem] py-[0.52875rem] bg-black text-white font-body rounded-full hover:opacity-70 transition-colors w-fit">
                    Shop
                  </button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
}