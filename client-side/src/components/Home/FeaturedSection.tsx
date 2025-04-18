// src/components/Home/FeaturedSection.tsx
import { IFeaturedProducts } from "@/types";
import Link from "next/link";
import FeaturedSwiper from "./FeaturedSwiper";

interface FeaturedSectionProps {
  featuredSection: IFeaturedProducts[];
}

const genderLinks = [
  { href: "/products?gender=Nam", label: "Nam" },
  { href: "/products?gender=Nữ", label: "Nữ" },
  { href: "/products?gender=Unisex", label: "Unisex" },
];

export default function FeaturedSection({
  featuredSection,
}: FeaturedSectionProps) {
  if (!featuredSection || featuredSection.length === 0) {
    return (
      <div>
        <p className="text-center text-gray-500 font-body">
          Không có sản phẩm nào để hiển thị.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-[1.5rem] pb-6 font-heading font-bold">
        Mua Sắm Theo Giới Tính
      </h1>

      {/* Mobile: Swiper */}
      <div className="block tablet:hidden overflow-x-hidden">
        <FeaturedSwiper featuredSection={featuredSection} />
      </div>

      {/* Tablet/Desktop: Grid */}
      <div className="hidden tablet:grid tablet:grid-cols-2 desktop:grid-cols-3 gap-4 desktop:gap-8">
        {featuredSection.map((product) => {
          // Tìm href dựa trên product.gender
          const genderLink = genderLinks.find(
            (link) => link.label === product.gender
          ) || { href: "/products", label: "Danh mục" };

          return (
            <div key={product.id} className="flex flex-col items-start gap-5">
              <img
                src={`/featured/${product.banner}`}
                alt={`Featured ${product.gender || "Sản phẩm"}`}
                className="w-auto h-[25.625rem] object-cover rounded select-none tablet:h-80 desktop:w-full desktop:h-auto desktop:object-contain"
                draggable="false"
              />
              <Link
                href={genderLink.href}
                className="featured_action px-[0.7475rem] py-[0.52875rem] text-[1rem] leading-none bg-black text-white font-body rounded-full hover:opacity-70 transition-colors"
              >
                Shop {product.gender || "Danh mục"}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}