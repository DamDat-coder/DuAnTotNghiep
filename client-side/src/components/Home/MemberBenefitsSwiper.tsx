// src/components/MemberBenefitsSwiper.tsx
"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { IMemberBenefit } from "@/types";

interface MemberBenefitsSwiperProps {
  benefits: IMemberBenefit[];
}

export default function MemberBenefitsSwiper({ benefits }: MemberBenefitsSwiperProps) {
  return (
    <Swiper
      spaceBetween={16} // Khoảng cách phù hợp cho mobile
      slidesPerView={1.2} // Hiển thị 1.5 slide trên mobile
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
              className="w-[18.75rem] h-[25.625rem] object-cover rounded select-none"
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
        </SwiperSlide>
      ))}
    </Swiper>
  );
}