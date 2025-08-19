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
      grabCursor
      breakpoints={{
        0: { slidesPerView: mobileSlidesPerView },
        768: { slidesPerView: tabletSlidesPerView },
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
              className="relative w-full aspect-[3/4] rounded overflow-hidden"
              onMouseEnter={() => setHoveredId(product.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <Image
                src={`/featured/${product.banner}`}
                alt={`Featured ${product.gender || "Sản phẩm"}`}
                fill
                className="object-cover"
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
