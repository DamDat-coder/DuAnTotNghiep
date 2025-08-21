"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface DesktopImageGalleryProps {
  images: string[];
  productName: string;
  isOutOfStock?: boolean;
  isWishlistOpen?: boolean;
}

export default function DesktopImageGallery({
  images,
  productName,
  isOutOfStock = false,
  isWishlistOpen = false,
}: DesktopImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(images[0] || "");
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const imageRef = useRef<HTMLDivElement>(null);

  const handleThumbnailClick = (image: string) => {
    setSelectedImage(image);
    setIsZoomed(false); // Reset zoom khi đổi ảnh
  };

  const handleMainImageClick = () => {
    setIsZoomed((prev) => !prev);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current || !isZoomed) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  return (
    <div className="flex gap-4">
      {/* Thumbnail column */}
      <div className="flex flex-col gap-2 w-auto max-w-[120px]">
        {images.map((img, index) => (
          <div
            key={img}
            className={`cursor-pointer rounded-md overflow-hidden border ${
              selectedImage === img ? "border-black" : "border-transparent"
            }`}
            onClick={() => setSelectedImage(img)}
          >
            <Image
              src={img}
              alt={`${productName} - Thumbnail`}
              width={80}
              height={80}
              className="object-cover w-[80px] h-[80px]"
            />
          </div>
        ))}
      </div>

      {/* Main Image */}
      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedImage}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            ref={imageRef}
            className="overflow-hidden rounded-md relative"
            onClick={handleMainImageClick}
            onMouseMove={handleMouseMove}
            style={{
              cursor: isZoomed ? "zoom-out" : "zoom-in",
            }}
          >
            <Image
              src={selectedImage}
              alt={`${productName} - Active`}
              width={600}
              height={450}
              draggable={false}
              className="w-full h-auto object-cover transition-transform duration-200 ease-out"
              style={{
                transform: isZoomed ? "scale(2)" : "scale(1)",
                transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
              }}
            />
            {isOutOfStock && !isWishlistOpen && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20">
                <span className="text-white text-2xl font-bold select-none">
                  Sản phẩm hết hàng
                </span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
