"use client";

import { IFeaturedProducts } from "@/types/product";
import { ICategory } from "@/types/category";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import Image from "next/image";
import { useState } from "react";
import FeaturedCardOverlay from "./FeaturedCardOverlay";

interface FeaturedSwiperProps {
  featuredSection: IFeaturedProducts[];
  categories: ICategory[];
  mobileSlidesPerView?: number;
  tabletSlidesPerView?: number;
}

export default function FeaturedSwiper({
  featuredSection,
  categories,
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
        const matchedCategory = product.gender
          ? categories.find((cat) => cat.name === product.gender)
          : null;
        const genderLink = matchedCategory
          ? { href: `/products?id_cate=${matchedCategory._id}`, label: product.gender }
          : { href: "/products", label: "Danh mục" };

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
                width={300}
                height={300}
                className="w-full h-auto object-cover rounded select-none"
                draggable="false"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.src = "/fallback.jpg";
                }}
              />
              <FeaturedCardOverlay
                hovered={hoveredId === product.id}
                description={product.description}
                linkHref={genderLink.href}
                linkLabel={genderLink.label}
              />
            </div>
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
}
