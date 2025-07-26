"use client";

import { useSearchParams } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import Link from "next/link";
import "swiper/css";
import { useEffect, useState } from "react";
import { useCategories } from "@/contexts/CategoriesContext";

interface Category {
  _id: string;
  name: string;
  parentId: string | null;
  children?: Category[];
}

interface CategorySwiperProps {
  categories: Category[];
}

export default function CategorySwiper({ categories }: CategorySwiperProps) {
  const searchParams = useSearchParams();
  const [hasMounted, setHasMounted] = useState(false);
  const { tree } = useCategories();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const currentIdCate = hasMounted ? searchParams.get("id_cate") : null;

  // Tìm danh mục cha nếu currentIdCate là danh mục con
  const parentCategory = tree.find((cat) =>
    cat.children?.some((child) => child._id === currentIdCate)
  );
  const parentId = parentCategory?._id || null;

  // Lọc danh mục con dựa trên danh mục cha hoặc hiển thị danh mục gốc
  const displayCategories = parentId
    ? parentCategory?.children || []
    : categories.filter((cat) => !cat.parentId);

  // Kiểm tra xem currentIdCate có phải là danh mục gốc (Unisex, Nam, Nữ)
  const isRootCategory = categories.some(
    (cat) => cat._id === currentIdCate && !cat.parentId
  );

  // Nếu có danh mục con đang active, "Tất cả" dẫn đến danh mục cha, nếu không thì dẫn đến /products
  const allLinkHref = parentId
    ? `/products?id_cate=${encodeURIComponent(parentId)}`
    : "/products";

  return (
    <Swiper
      spaceBetween={16}
      slidesPerView={3.5}
      breakpoints={{
        768: { slidesPerView: 5 },
        1024: { slidesPerView: 7 },
        1920: { slidesPerView: 9 },
      }}
      loop={false}
      grabCursor={true}
      className="select-none my-4 border-b-2 border-[#D1D1D1] border-solid"
    >
      {parentId && parentCategory && (
        <SwiperSlide className="!w-auto">
          <Link
            href={`/products?id_cate=${encodeURIComponent(parentCategory._id)}`}
            className={`text-base hover:text-black ${
              currentIdCate === parentCategory._id
                ? "text-black font-bold"
                : "text-gray-700"
            }`}
          >
            Tất cả
          </Link>
        </SwiperSlide>
      )}

      {displayCategories.map((category) => {
        const isActive = currentIdCate === category._id;

        return (
          <SwiperSlide key={category._id} className="!w-auto">
            <Link
              href={`/products?id_cate=${encodeURIComponent(category._id)}`}
              className={`text-base hover:text-black ${
                isActive ? "text-black font-bold" : "text-gray-700"
              }`}
            >
              {category.name}
            </Link>
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
}
