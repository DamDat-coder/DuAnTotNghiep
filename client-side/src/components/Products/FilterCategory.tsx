"use client";

import { useMemo } from "react";
import { CategoryOption } from "@/types/filter";
import { useCategories } from "@/contexts/CategoriesContext";

interface FilterCategoryProps {
  selectedCategory: string | null;
  setSelectedCategory: (value: string | null) => void;
}

export default function FilterCategory({
  selectedCategory,
  setSelectedCategory,
}: FilterCategoryProps) {
  const { flat, isLoading, error } = useCategories();

  // Loại bỏ "Bài viết" và tạo danh sách tùy chọn
  const categoryOptions: CategoryOption[] = useMemo(() => {
    if (!flat) return [];
    return flat
      .filter((cat) => cat._id !== "684d0f12543e02998d9df097")
      .map((cat) => ({
        value: cat._id,
        label: cat.name,
      }))
      .sort((a, b) => b.label.localeCompare(a.label));
  }, [flat]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 border-b pb-4 mt-4">
        <h3 className="text-base font-bold">Danh mục</h3>
        <p className="text-sm text-gray-500">Đang tải...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4 border-b pb-4 mt-4">
        <h3 className="text-base font-bold">Danh mục</h3>
        <p className="text-sm text-red-500">Lỗi: {error}</p>
      </div>
    );
  }

  if (categoryOptions.length === 0) {
    return (
      <div className="flex flex-col gap-4 border-b pb-4 mt-4">
        <h3 className="text-base font-bold">Danh mục</h3>
        <p className="text-sm text-gray-500">Không có danh mục nào.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 border-b pb-4 mt-4">
      <h3 className="text-base font-bold">Danh mục</h3>
      <div className="flex flex-col gap-2 mt-2">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="radio"
            name="category"
            value=""
            checked={selectedCategory === null}
            onChange={() => setSelectedCategory(null)}
            className="h-4 w-4 accent-black focus:ring-black"
          />
          <span>Tất cả danh mục</span>
        </label>
        {categoryOptions.map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-2 text-sm cursor-pointer"
          >
            <input
              type="radio"
              name="category"
              value={option.value}
              checked={selectedCategory === option.value}
              onChange={() => setSelectedCategory(option.value)}
              className="h-4 w-4 accent-black focus:ring-black"
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
