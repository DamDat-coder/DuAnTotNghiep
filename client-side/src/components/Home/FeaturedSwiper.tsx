"use client";

import { IFeaturedProducts } from "@/types/product";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import Image from "next/image";
import { useState } from "react";

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
  const [hoveredId, setHoveredId] = useState<string | null>(null);

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
          <SwiperSlide key={product.id}>
            <div
              className="relative w-full h-full"
              onMouseEnter={() => setHoveredId(product.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <Image
                src={`/featured/${product.banner}`}
                alt={`Featured ${product.gender || "Sản phẩm"}`}
                width={120}
                height={40}
                className="w-full h-[auto object-cover rounded select-none"
                draggable="false"
              />
              <div
                className={`absolute inset-0 bg-black transition-opacity duration-300 ${
                  hoveredId === product.id ? "opacity-80" : "opacity-0"
                }`}
              ></div>

              <div className="absolute w-full px-20 inset-0 flex items-center justify-center transition-opacity duration-300">
                <div className="w-full flex flex-col gap-6 items-start justify-center">
                  <div
                    className={`text-lg text-white transition-opacity duration-300 ${
                      hoveredId === product.id ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    {product.description}
                  </div>
                  <Link
                    className="flex items-center justify-center"
                    href={genderLink.href}
                  >
                    <div
                      className={`w-auto text-lg font-bold text-black bg-white px-6 py-3 rounded-full transition-opacity duration-300 ${
                        hoveredId === product.id ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      Shop {product.gender || "Danh mục"}
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
}
