"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface DesktopImageGalleryProps {
  images: string[];
  productName: string;
}

export default function DesktopImageGallery({
  images,
  productName,
}: DesktopImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(images[0] || "");
  const [isClickZoom, setIsClickZoom] = useState(false); // Zoom bằng click
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(true); // Tooltip hiển thị
  const imageRef = useRef<HTMLDivElement>(null);

  // Tự động ẩn tooltip sau 3 giây hoặc khi zoom
  useEffect(() => {
    if (showTooltip && isClickZoom) {
      setShowTooltip(false);
    } else if (showTooltip) {
      const timer = setTimeout(() => setShowTooltip(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showTooltip, isClickZoom]);

  const handleImageClick = (image: string) => {
    setSelectedImage(image);
    setShowTooltip(true); // Hiển thị tooltip khi đổi ảnh
    setIsClickZoom(false); // Tắt zoom khi đổi ảnh
  };

  const handleMainImageClick = () => {
    setIsClickZoom((prev) => !prev); // Toggle zoom bằng click
    setShowTooltip(false); // Ẩn tooltip khi click
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current || !isClickZoom) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100; // Phần trăm X
    const y = ((e.clientY - rect.top) / rect.height) * 100; // Phần trăm Y
    setMousePosition({ x, y });
  };

  return (
    <div className="flex gap-4">
      {/* Thumbnail column on the left */}
      <div className="flex flex-col gap-2 w-auto max-w-[120px]">
        {images.map((image, index) => (
          <motion.div
            key={index}
            className={`cursor-pointer border-2 rounded-md overflow-hidden ${
              selectedImage === image ? "border-blue-500" : "border-transparent"
            }`}
            onClick={() => handleImageClick(image)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Image
              src={`/product/img/${image}`}
              alt={`${productName} - Thumbnail ${index + 1}`}
              width={100}
              height={75}
              className="w-[4rem] h-[4rem] object-cover"
            />
          </motion.div>
        ))}
      </div>

      {/* Main active image on the right */}
      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedImage}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="rounded-md overflow-hidden relative"
            ref={imageRef}
            onClick={handleMainImageClick}
            onMouseMove={handleMouseMove}
            style={{ cursor: "zoom-in" }}
          >
            <Image
              src={`/product/img/${selectedImage}`}
              alt={`${productName} - Active Image`}
              width={600}
              height={450}
              draggable="false"
              className={`w-full h-auto object-cover transition-transform duration-0 ${
                isClickZoom ? "scale-150" : "scale-100"
              }`}
              style={{
                transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
              }}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
