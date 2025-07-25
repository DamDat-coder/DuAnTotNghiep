"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface SizeChartPopupProps {
  isSizeChartOpen: boolean;
  handleCloseSizeChart: () => void;
}

export default function SizeChartPopup({
  isSizeChartOpen,
  handleCloseSizeChart,
}: SizeChartPopupProps) {
  return (
    <AnimatePresence>
      {isSizeChartOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
          onClick={handleCloseSizeChart}
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-4 rounded-lg relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseSizeChart}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl font-bold"
              aria-label="Đóng bảng kích thước"
            >
              <Image
                src="/nav/nav_clear.svg"
                alt="Close Icon"
                width={16}
                height={16}
                className="w-4 h-4"
              />
            </button>
            <Image
              key="size_chart_img"
              src="/product/product_size_table.png"
              alt="Bảng kích thước"
              width={300}
              height={200}
              className="w-[40vw] h-[40vh] object-contain"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}