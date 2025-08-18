"use client";

import Image from "next/image";
import { MouseEventHandler } from "react";
import FadeInWhenVisible from "@/components/Core/Animation/FadeInWhenVisible";
import BannerContent from "./BannerContent";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

interface BannerProps {
  id: string;
  title?: string;
  status: string;
  name: string;
  description: string;
  images: string[]; // Array of image URLs
  altText: string;
}

export default function Banner({
  id,
  title,
  status,
  name,
  description,
  images,
  altText,
}: BannerProps) {
  // Ensure at least one image to avoid empty swiper
  const validImages = images.length > 0 ? images : ["/fallback.jpg"];

  return (
    <FadeInWhenVisible>
      <div className="banner w-full">
        {title && (
          <h1 className="px-4 text-[1.5rem] font-bold laptop:text-[1.5rem] desktop:text-[1.5rem] desktop:font-bold pb-6">
            {title}
          </h1>
        )}

        {/* Mobile/Tablet layout */}
        <div className="px-4 laptop:hidden desktop:hidden">
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={0}
            slidesPerView={1}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            loop={true}
            className="w-full"
          >
            {validImages.map((image, index) => (
              <SwiperSlide key={index}>
                <Image
                  src={image}
                  alt={`${altText} ${index + 1}`}
                  width={672}
                  height={672}
                  className="w-full h-auto tablet:h-[37.5rem] object-cover"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.src = "/fallback.jpg";
                  }}
                />
              </SwiperSlide>
            ))}
          </Swiper>
          {/* Place BannerContent below the swiper for mobile/tablet */}
          <BannerContent
            id={id}
            status={status}
            name={name}
            description={description}
          />
        </div>

        {/* Desktop/Laptop layout */}
        <div className="hidden laptop:flex desktop:flex w-full">
          <div className="relative w-full">
            <Swiper
              modules={[Autoplay, Pagination]}
              spaceBetween={0}
              slidesPerView={2}
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              pagination={{ clickable: true }}
              loop={validImages.length >= 2} // Only loop if enough images
              className="w-full"
            >
              {validImages.map((image, index) => (
                <SwiperSlide key={index}>
                  <Image
                    src={image}
                    alt={`${altText} ${index + 1}`}
                    width={1280}
                    height={800}
                    className="w-full h-[50rem] object-cover"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.src = "/fallback.jpg";
                    }}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
            {/* Place BannerContent in a gradient overlay for desktop/laptop */}
            <div className="absolute bottom-0 z-40 w-full h-[33.33%] bg-gradient-to-b from-transparent to-black flex justify-center items-center">
              <BannerContent
                id={id}
                status={status}
                name={name}
                description={description}
                dark
              />
            </div>
          </div>
        </div>

        {/* Custom pagination styling */}
        <style jsx>{`
          .swiper-pagination-bullet {
            background: #fff;
            opacity: 0.7;
            width: 10px;
            height: 10px;
            margin: 0 4px;
          }
          .swiper-pagination-bullet-active {
            background: #000;
            opacity: 1;
          }
          .swiper-pagination {
            padding-bottom: 10px;
          }
        `}</style>
      </div>
    </FadeInWhenVisible>
  );
}
