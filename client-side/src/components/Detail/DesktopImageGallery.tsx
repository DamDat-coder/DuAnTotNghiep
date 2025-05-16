"use client";

import { useState } from "react";
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
  const [showAll, setShowAll] = useState(false);

  const toggleShow = () => setShowAll((prev) => !prev);

  return (
    <div className="relative">
      <div
        className={`grid grid-cols-2 gap-0 overflow-hidden transition-all duration-500 ${
          showAll ? "max-h-full" : "max-h-full"
        }`}
      >
        <AnimatePresence>
          {(showAll ? images : images.slice(0, 4)).map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Image
                src={`/product/img/${image}`}
                alt={`${productName} - Ảnh ${index + 1}`}
                width={380}
                height={285}
                className="w-full h-auto object-cover"
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex justify-center items-center gap-2 py-2 px-4 border-2 border-black border-solid w-[15%] bg-white cursor-pointer z-10"
        onClick={toggleShow}
      >
        <span className="text-base font-bold">
          {showAll ? "ẨN BỚT" : "XEM THÊM"}
        </span>
        <Image
          src={`/nav/${showAll ? "detail_img_up.svg" : "detail_img_down.svg"}`}
          alt={showAll ? "Ẩn bớt" : "Xem thêm"}
          width={16}
          height={16}
        />
      </div>
    </div>
  );
}
