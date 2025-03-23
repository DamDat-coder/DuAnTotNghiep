// src/components/MemberBenefitsBanner.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { MemberBenefit } from "../types";
import { fetchMemberBenefits } from "../services/api";
import "swiper/css";

export default function MemberBenefitsBanner() {
  const [benefits, setBenefits] = useState<MemberBenefit[]>([]);
  const [slidesPerView, setSlidesPerView] = useState(1.5); // Giá trị mặc định

  useEffect(() => {
    // Fetch benefits
    async function loadBenefits() {
      const data = await fetchMemberBenefits();
      setBenefits(data);
    }
    loadBenefits();

    // Cập nhật slidesPerView dựa trên kích thước màn hình
    const handleResize = () => {
      if (typeof window !== "undefined") {
        setSlidesPerView(window.innerWidth >= 1920 ? 3 : 1.5);
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
      <div className="member-benefits w-full mx-auto max-w-md tablet:max-w-2xl desktop:w-[90%] desktop:max-w-[2560px] py-4">
        <p className="text-center text-gray-500">
          Không có quyền lợi nào để hiển thị.
        </p>
      </div>
    );
  }

  return (
    <div className="member-benefits w-full mx-auto max-w-md tablet:max-w-2xl desktop:w-[90%] desktop:max-w-[2560px]">
      <h1 className="text-[1.5rem] pb-6 font-bold">Quyền Lợi Thành Viên</h1>
      <Swiper
        spaceBetween={typeof window !== "undefined" && window.innerWidth >= 1920 ? 109 : 16}
        slidesPerView={slidesPerView}
        loop={false}
        grabCursor={true}
        className="select-none"
      >
        {benefits.map((benefit) => (
          <SwiperSlide key={benefit.id}>
            <div className="flex flex-col items-start gap-5">
              <img
                src={`/memberBenefit/${benefit.image}`}
                alt={benefit.benefit}
                className="w-full h-[25.625rem] object-cover rounded select-none tablet:h-80 desktop:w-[25.625rem] desktop:h-auto"
                draggable="false"
              />
              <div className="absolute inset-0 bg-black/20 rounded"></div>
              <div className="w-[55%] absolute bottom-[1.5rem] left-[1.5rem] flex flex-col gap-2">
                <div className="text-[1.5rem] font-bold text-white tablet:text-2xl desktop:text-3xl leading-[1.8125rem] flex flex-wrap">
                  {benefit.benefit}
                </div>
                <button className="text-[1rem] px-[0.7475rem] py-[0.52875rem] bg-black text-white font-bold rounded-full hover:opacity-70 transition-colors w-fit">
                  Shop
                </button>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}