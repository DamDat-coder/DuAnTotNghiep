// src/components/Home/FeaturedSwiper.tsx
"use client";

import { IFeaturedProducts } from "@/types/product";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

interface FeaturedSwiperProps {
  featuredSection: IFeaturedProducts[];
  mobileSlidesPerView?: number;
  tabletSlidesPerView?: number;
}

const genderLinks = [
  { href: "/products?gender=Nam", label: "Nam" },
  { href: "/products?gender=Nữ", label: "Nữ" },
  { href: "/products?gender=Unisex", label: "Unisex" },
];

export default function FeaturedSwiper({
  featuredSection,
  mobileSlidesPerView = 1.2,
  tabletSlidesPerView = 2.5,
}: FeaturedSwiperProps) {
  return (
    <Swiper
      spaceBetween={10}
      loop={false}
      grabCursor={true}
      breakpoints={{
        0: {
          slidesPerView: mobileSlidesPerView,
        },

        768: {
          slidesPerView: tabletSlidesPerView,
        },
      }}
      className="select-none"
    >
      {featuredSection.map((product) => {
        const genderLink = genderLinks.find(
          (link) => link.label === product.gender
        ) || { href: "/products", label: "Danh mục" };

        return (
          <SwiperSlide key={product.id} className="!w-[16.8125rem]">
            <div className="flex flex-col items-start gap-5">
              <img
                src={`/featured/${product.banner}`}
                alt={`Featured ${product.gender || "Sản phẩm"}`}
                className="w-[16.8125rem] h-[25.625rem] object-cover rounded select-none"
                draggable="false"
              />
              <Link
                href={genderLink.href}
                className="featured_action px-[0.7475rem] py-[0.52875rem] text-[1rem] leading-none bg-black text-white font-body rounded-full hover:opacity-70 transition-colors"
              >
                Shop {product.gender || "Danh mục"}
              </Link>
            </div>
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
}
