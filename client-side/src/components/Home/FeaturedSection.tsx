"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { IFeaturedProducts } from "@/types/product";
import FadeInWhenVisible from "@/components/Core/Animation/FadeInWhenVisible";
import FeaturedSwiper from "./FeaturedSwiper";
import { useCategories } from "@/contexts/CategoriesContext";

interface FeaturedSectionProps {
  featuredSection: IFeaturedProducts[];
  mobileSlidesPerView?: number;
  tabletSlidesPerView?: number;
}

export default function FeaturedSection({
  featuredSection,
  mobileSlidesPerView = 1.5,
  tabletSlidesPerView = 2.5,
}: FeaturedSectionProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { tree, isLoading, error } = useCategories();
  const categories = tree.filter(
    (cat) =>
      cat.parentId === null &&
      cat._id !== "684d0f12543e02998d9df097" &&
      cat.name !== "Bài viết"
  );

  if (isLoading) return <p>Đang tải danh mục...</p>;
  if (error) return <p className="text-red-500">Lỗi: {error}</p>;
  if (!featuredSection || featuredSection.length === 0)
    return <p className="text-gray-500">Không có sản phẩm nào để hiển thị.</p>;

  return (
    <FadeInWhenVisible>
      <div>
        <h1 className="text-[1.5rem] pb-6 font-heading font-bold">
          Mua Sắm Theo Giới Tính
        </h1>

        {/* Mobile: Swiper */}
        <div className="block tablet:px-0 desktop:hidden laptop:hidden overflow-x-hidden">
          <FeaturedSwiper
            featuredSection={featuredSection}
            mobileSlidesPerView={mobileSlidesPerView}
            tabletSlidesPerView={tabletSlidesPerView}
          />
        </div>

        {/* Laptop/Desktop: Grid */}
        <div className="hidden tablet:hidden desktop:grid laptop:grid desktop:grid-cols-3 laptop:grid-cols-3 gap-4 desktop:gap-8 laptop:gap-8">
          {featuredSection.map((product) => {
            const matchedCategory = product.gender
              ? categories.find((cat) => cat.name === product.gender)
              : null;
            const genderLink = matchedCategory
              ? {
                  href: `/products?id_cate=${matchedCategory._id}`,
                  label: product.gender,
                }
              : { href: "/products", label: "Danh mục" };

            return (
              <div
                key={product.id}
                className="relative flex flex-col items-start gap-5"
                onMouseEnter={() => setHoveredId(product.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <Image
                  src={`/featured/${product.banner}`}
                  alt={`Featured ${product.gender || "Sản phẩm"}`}
                  width={120}
                  height={40}
                  className="w-auto h-auto object-cover rounded select-none tablet:h-80 desktop:w-full desktop:h-auto desktop:object-contain laptop:w-full laptop:h-auto laptop:object-contain"
                  draggable="false"
                />
                <div
                  className={`absolute inset-0 bg-black transition-opacity duration-300 ${
                    hoveredId === product.id ? "opacity-80" : "opacity-0"
                  }`}
                ></div>
                <div className="absolute w-full px-20 inset-0 flex items-center justify-center transition-opacity duration-300">
                  <div className="w-full flex flex-col gap-6 items-start justify-center">
                    <div
                      className={`text-lg text-white transition-opacity duration-300 ${
                        hoveredId === product.id ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      {product.description}
                    </div>
                    <Link
                      className="flex items-center justify-center"
                      href={genderLink.href}
                    >
                      <div
                        className={`w-auto text-lg font-bold text-black bg-white px-6 py-3 rounded-full transition-opacity duration-300 ${
                          hoveredId === product.id ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        Shop {genderLink.label}
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </FadeInWhenVisible>
  );
}
