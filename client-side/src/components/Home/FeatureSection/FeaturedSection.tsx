"use client";

import { useState } from "react";
import Image from "next/image";
import { IFeaturedProducts } from "@/types/product";
import FadeInWhenVisible from "@/components/Core/Animation/FadeInWhenVisible";
import FeaturedSwiper from "./FeaturedSwiper";
import { useCategories } from "@/contexts/CategoriesContext";
import FeaturedCardOverlay from "./FeaturedCardOverlay";

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
  if (!featuredSection?.length)
    return <p className="text-gray-500">Không có sản phẩm nào để hiển thị.</p>;

  return (
    <FadeInWhenVisible>
      <div>
        <h1 className="text-[1.5rem] pb-6 font-heading font-bold">
          Mua Sắm Theo Giới Tính
        </h1>

        {/* Mobile/Tablet: Swiper */}
        <div className="block tablet:px-0 desktop:hidden laptop:hidden">
          <FeaturedSwiper
            featuredSection={featuredSection}
            categories={categories}
            mobileSlidesPerView={mobileSlidesPerView}
            tabletSlidesPerView={tabletSlidesPerView}
          />
        </div>

        {/* Desktop/Laptop: Grid */}
        <div className="hidden tablet:hidden desktop:grid laptop:grid grid-cols-3 gap-6">
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
                className="relative flex flex-col items-start"
                onMouseEnter={() => setHoveredId(product.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Dùng aspect ratio thay vì height cứng */}
                <div className="w-full aspect-[3/4] relative rounded overflow-hidden">
                  <Image
                    src={`/featured/${product.banner}`}
                    alt={`Featured ${product.gender || "Sản phẩm"}`}
                    fill
                    className="object-cover"
                    draggable="false"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.src = "/fallback.jpg";
                    }}
                  />
                  <FeaturedCardOverlay
                    hovered={hoveredId === product.id}
                    description={product.description}
                    linkHref={genderLink.href}
                    linkLabel={genderLink.label}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </FadeInWhenVisible>
  );
}
