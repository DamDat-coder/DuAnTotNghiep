"use client";

import Image from "next/image";
import FadeInWhenVisible from "@/components/Core/Animation/FadeInWhenVisible";
import BannerContent from "./BannerContent";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

export interface BannerProps {
  id: string;
  title?: string;
  status: string;
  name: string;
  description: string;
  images?: string[];    // hỗ trợ nhận mảng ảnh từ ngoài
  altText?: string;     // để optional cho linh hoạt
}

const DEFAULT_IMAGES = [
  "https://res.cloudinary.com/testupload1/image/upload/v1756111205/products/bjx7bspaunvmc7vpwinz.webp",
  "https://res.cloudinary.com/testupload1/image/upload/v1756111207/products/lnmdndsoeh3vtez1kvwa.webp",
  "https://res.cloudinary.com/testupload1/image/upload/v1756111206/products/nt1sdpx80hlbaravqboq.webp",
  "https://res.cloudinary.com/testupload1/image/upload/v1756022916/products/jzvb2955irdd5qqaoqyj.webp",
  "https://res.cloudinary.com/testupload1/image/upload/v1756022915/products/mzra8htvkjryun0mtwpa.webp",
];

const FALLBACK = "/fallback.jpg";

export default function Banner({
  id,
  title,
  status,
  name,
  description,
  images,
  altText,
}: BannerProps) {
  // Ưu tiên ảnh từ props, không có thì dùng mặc định
  const resolved = (images?.length ? images : DEFAULT_IMAGES).slice(0, 8);
  const slides = resolved.length > 0 ? resolved : [FALLBACK];
  const canLoop = slides.length > 1;

  return (
    <FadeInWhenVisible>
      <div className="banner w-full">
        {title && (
          <h1 className="px-4 text-[1.5rem] font-bold laptop:text-[1.5rem] desktop:text-[1.5rem] desktop:font-bold pb-6">
            {title}
          </h1>
        )}

        {/* Mobile/Tablet */}
        <div className="px-4 laptop:hidden desktop:hidden">
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={0}
            slidesPerView={1}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            loop={canLoop}
            className="w-full"
          >
            {slides.map((src, index) => (
              <SwiperSlide key={`${src}-${index}`}>
                <Image
                  src={src}
                  alt={`${altText ?? name} ${index + 1}`}
                  width={672}
                  height={672}
                  sizes="100vw"
                  className="w-full h-auto tablet:h-[37.5rem] object-cover"
                  priority={index === 0}
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK;
                  }}
                />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Nội dung dưới slider cho mobile/tablet */}
          <BannerContent
            id={id}
            status={status}
            name={name}
            description={description}
          />
        </div>

        {/* Desktop/Laptop */}
        <div className="hidden laptop:flex desktop:flex w-full">
          <div className="relative w-full">
            <Swiper
              modules={[Autoplay, Pagination]}
              spaceBetween={0}
              slidesPerView={2}
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              pagination={{ clickable: true }}
              loop={canLoop}
              className="w-full"
            >
              {slides.map((src, index) => (
                <SwiperSlide key={`${src}-${index}`}>
                  <Image
                    src={src}
                    alt={`${altText ?? name} ${index + 1}`}
                    width={1280}
                    height={800}
                    sizes="(max-width: 1280px) 100vw, 1280px"
                    className="w-full h-[50rem] object-cover"
                    priority={index === 0}
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK;
                    }}
                  />
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Overlay nội dung cho desktop/laptop */}
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
