"use client";

import Image from "next/image";
import { MouseEventHandler } from "react";
import FadeInWhenVisible from "@/components/Core/Animation/FadeInWhenVisible";
import BannerContent from "./BannerContent";

interface BannerProps {
  title?: string;
  status: string;
  name: string;
  description: string;
  image1: string;
  image2: string;
  altText: string;
  onShopClick?: MouseEventHandler<HTMLButtonElement>;
}

export default function Banner({
  title,
  status,
  name,
  description,
  image1,
  image2,
  altText,
  onShopClick,
}: BannerProps) {
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
          <Image
            src={image1}
            alt={altText}
            width={672}
            height={672}
            className="w-full h-auto tablet:h-[37.5rem] object-cover"
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              target.src = "/fallback.jpg";
            }}
          />
          <BannerContent
            status={status}
            name={name}
            description={description}
            onClick={onShopClick}
          />
        </div>

        {/* Desktop layout */}
        <div className="hidden laptop:flex desktop:flex w-full">
          <div className="relative w-full flex">
            <div className="w-[50%]">
              <Image
                src={image1}
                alt={altText}
                width={1280}
                height={800}
                className="w-full h-[50rem] object-cover"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.src = "/fallback.jpg";
                }}
              />
            </div>

            <div className="w-[50%]">
              <Image
                src={image2}
                alt={altText}
                width={1280}
                height={800}
                className="w-full h-[50rem] object-cover"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.src = "/fallback.jpg";
                }}
              />
            </div>

            <div className="absolute bottom-0 w-full h-[33.33%] bg-gradient-to-b from-transparent to-black flex justify-center items-center">
              <BannerContent
                status={status}
                name={name}
                description={description}
                dark
                onClick={onShopClick}
              />
            </div>
          </div>
        </div>
      </div>
    </FadeInWhenVisible>
  );
}
