// src/components/ProductImageSwiper.tsx
"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import "swiper/css";

interface ProductImageSwiperProps {
  images: string[];
  productName: string;
}

export default function ProductImageSwiper({
  images,
  productName,
}: ProductImageSwiperProps) {
  return (
    <Swiper spaceBetween={10} slidesPerView={1} loop={true} className="w-full">
      {images.map((image, index) => (
        <SwiperSlide key={index}>
          <Image
            src={`${image}`}
            alt={`${productName} - Ảnh ${index + 1}`}
            width={533}
            height={400}
            style={{ width: "auto", height: "400px" }}
            className="mx-auto"
            sizes="(max-width: 768px) 100vw, 533px"
            quality={90}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
