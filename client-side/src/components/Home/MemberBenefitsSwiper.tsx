// src/components/MemberBenefitsSwiper.tsx
"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { IMemberBenefit } from "@/types/product";
import Image from "next/image";
interface MemberBenefitsSwiperProps {
  benefits: IMemberBenefit[];
  mobileSlidesPerView?: number;
  tabletSlidesPerView?: number;
}

export default function MemberBenefitsSwiper({
  benefits,
  mobileSlidesPerView = 1.2,
  tabletSlidesPerView = 2.5,
}: MemberBenefitsSwiperProps) {
  return (
    <Swiper
      spaceBetween={16}
      loop={false}
      grabCursor={true}
      className="select-none"
      breakpoints={{
        0: {
          slidesPerView: mobileSlidesPerView,
        },

        768: {
          slidesPerView: tabletSlidesPerView,
        },
      }}
    >
      {benefits.map((benefit) => (
        <SwiperSlide key={benefit.id}>
          <div className="relative w-full h-full">
            <Image
              src={`/memberBenefit/${benefit.image}`}
              alt={benefit.benefit}
              className="w-full h-[25.625rem] object-cover rounded select-none"
              draggable="false"
              width={120}
              height={40}
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
