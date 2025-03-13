// src/components/FeaturedSection.tsx
"use client";

import React, { useState, useRef } from "react";
import { Product } from "../types";

interface FeaturedSectionProps {
  products: Product[];
}

export default function FeaturedSection({ products }: FeaturedSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);

  const sliderRef = useRef<HTMLDivElement>(null);
  const slideGap = 16;

  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setStartX(e.pageX - translateX);
    if (sliderRef.current) {
      sliderRef.current.style.cursor = "grabbing";
    }
  };

  const handleDragMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    const currentX = e.pageX;
    const newTranslateX = currentX - startX;
    setTranslateX(newTranslateX);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    if (sliderRef.current) {
      sliderRef.current.style.cursor = "grab";
    }

    const slideWidth = sliderRef.current?.offsetWidth || 0;
    const threshold = slideWidth / 3;
    const maxIndex = products.length - 1;

    const offsetSlides = Math.round(translateX / (slideWidth + slideGap));
    let newIndex = currentIndex - offsetSlides;

    if (newIndex < 0) newIndex = 0;
    if (newIndex > maxIndex) newIndex = maxIndex;

    setCurrentIndex(newIndex);
    setTranslateX(0);
  };

  if (!products || products.length === 0) {
    return (
      <div className="featured max-w-md mx-auto tablet:max-w-2xl desktop:max-w-4xl px-6 py-4">
        <p className="text-center text-gray-500">
          Không có sản phẩm nào để hiển thị.
        </p>
      </div>
    );
  }

  return (
    <div className="featured max-w-md mx-auto tablet:max-w-2xl desktop:max-w-4xl px-6 py-4">
      <div
        ref={sliderRef}
        className="relative overflow-hidden cursor-grab select-none"
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
      >
        <div
          className="flex gap-4 transition-transform duration-300 ease-out"
          style={{
            transform: `translateX(calc(-${
              currentIndex * 100
            }% + ${translateX}px - ${currentIndex * slideGap}px))`,
            willChange: "transform",
          }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="flex-shrink-0 w-full flex flex-col items-start gap-5"
            >
              <img
                src={`/featured/${product.image}`} // Dùng product.image từ MockAPI
                alt={`Featured ${product.name || "Sản phẩm"}`}
                className="w-full h-96 object-cover rounded select-none tablet:h-80 desktop:h-96"
                draggable="false"
              />
              <button className="featured_action w-32 px-6 py-2 bg-black text-white font-bold rounded-full hover:opacity-70 transition-colors self-start">
                Shop {product.category || "Danh mục"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
