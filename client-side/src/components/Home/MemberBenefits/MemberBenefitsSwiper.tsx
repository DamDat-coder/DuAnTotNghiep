"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { IMemberBenefit } from "@/types/product";
import MemberBenefitCard from "./MemberBenefitCard";


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
          <MemberBenefitCard
            image={benefit.image}
            benefit={benefit.benefit}
            linkHref="/products?id_cate=684d09e4543e02998d9df018"
            isDarkButton // dùng nút đen cho swiper
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
