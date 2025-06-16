"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { IProduct } from "@/types/product";

interface ProductDetailsSectionProps {
  product: IProduct;
}

export default function ProductDetailsSection({ product }: ProductDetailsSectionProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const handleSectionClick = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const sections = [
    {
      id: "product_details",
      title: "Chi tiết sản phẩm",
      content: [
        product.description || "Chưa có mô tả sản phẩm.",
      ],
    },
    {
      id: "size_chart",
      title: "Kích thước",
      content: [
        <Image
          key="size_chart_img"
          src="/product/product_size_table.png"
          alt="Bảng kích thước"
          width={300}
          height={200}
        />,
      ],
    },
    {
      id: "reviews",
      title: (
        <div className="flex justify-between items-center w-full text-base font-semibold">
          <span>Đánh giá</span>
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="black" stroke="black" />
              ))}
            </div>
            <motion.img
              src="/nav/footer_down.svg"
              alt="Dropdown"
              className="h-4 w-auto"
              animate={{
                rotate: activeSection === "reviews" ? 180 : 0,
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      ),
      content: [
        <div key="review_summary" className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex">
              {[...Array(4)].map((_, i) => (
                <Star key={i} size={16} fill="black" stroke="black" />
              ))}
              <Star size={16} stroke="black" />
            </div>
            <span>4.0 (10 đánh giá)</span>
          </div>
          <div className="text-sm text-[#B0B0B0]">
            <div className="flex items-center justify-between">
              <div className="flex">
                {[...Array(3)].map((_, i) => (
                  <Star key={i} size={16} fill="black" stroke="black" />
                ))}
                {[...Array(2)].map((_, i) => (
                  <Star key={i} size={16} stroke="black" />
                ))}
              </div>
              <span>TanNhutHa - Oct 29, 2024</span>
            </div>
            <p className="line-clamp-3">
              Sản phẩm chất lượng, màu sắc đẹp, đúng như mô tả.
            </p>
            <a href="#" className="text-[1rem] text-black hover:underline">
              Xem thêm
            </a>
          </div>
        </div>,
      ],
    },
  ];

  return (
    <div className="border-t-2 border-[#B0B0B0] border-solid laptop:mt-16 desktop:mt-16 desktop:w-[60%] desktop:mx-auto laptop:w-[60%] laptop:mx-auto">
      {sections.map(({ id, title, content }) => (
        <div key={id} className="border-b-2 border-[#B0B0B0] border-solid">
          <a
            href="#"
            className="w-full flex items-center justify-between no-underline hover:underline focus:no-underline py-4"
            onClick={(e) => {
              e.preventDefault();
              handleSectionClick(id);
            }}
          >
            {id === "reviews" ? (
              title
            ) : (
              <>
                <p className="text-base font-semibold">{title}</p>
                <motion.img
                  src="/nav/footer_down.svg"
                  alt="Dropdown"
                  className="h-4 w-auto"
                  animate={{ rotate: activeSection === id ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                />
              </>
            )}
          </a>
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: activeSection === id ? "auto" : 0,
              opacity: activeSection === id ? 1 : 0,
            }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden mt-2 text-left text-sm text-[#B0B0B0] space-y-1"
          >
            {content.map((item, index) =>
              typeof item === "string" ? (
                <p key={index} className="pb-4">{item}</p>
              ) : (
                <div key={index} className="pb-4">{item}</div>
              )
            )}
          </motion.div>
        </div>
      ))}
    </div>
  );
}