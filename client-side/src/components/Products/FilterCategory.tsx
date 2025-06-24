"use client"

import { useEffect, useState } from "react";
import { CategoryOption } from "@/types/filter";
import { fetchParentCategories } from "@/services/categoryApi";
import { ICategory } from "@/types/category";

interface FilterCategoryProps {
  selectedCategory: string | null;
  setSelectedCategory: (value: string | null) => void;
}

export default function FilterCategory({
  selectedCategory,
  setSelectedCategory,
}: FilterCategoryProps) {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCategories() {
      try {
        setLoading(true);
        const rootCategories = await fetchParentCategories();
        console.log("Root categories:", rootCategories);
        // Lọc bỏ danh mục "Bài viết"
        const filteredCategories = rootCategories.filter(
          (cat: ICategory) =>
            cat.id !== "684d0f12543e02998d9df097" && cat.name !== "Bài viết"
        );
        // Map sang CategoryOption
        const categoryOptions: CategoryOption[] = filteredCategories.map(
          (cat: ICategory) => ({
            value: cat.id,
            label: cat.name,
          })
        );
        console.log("Filtered category options:", categoryOptions);
        setCategories(categoryOptions);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Lỗi khi tải danh mục");
        console.error("Error loading categories:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, []);

  if (loading) {
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

  if (categories.length === 0) {
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
        {categories.map((option) => (
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