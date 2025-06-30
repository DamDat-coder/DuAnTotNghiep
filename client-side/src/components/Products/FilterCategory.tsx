"use client";

import { useEffect, useState } from "react";
import { CategoryOption } from "@/types/filter";
import { fetchCategoryTree, flattenCategories } from "@/services/categoryApi";
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
        const categoryTree = await fetchCategoryTree();
        // Lấy danh sách phẳng và loại trừ "Bài viết"
        const flatCategories = categoryTree.filter(
          (cat) => cat._id !== "684d0f12543e02998d9df097"
        );
        // Map sang CategoryOption, thêm tên danh mục cha nếu có
        const categoryOptions: CategoryOption[] = flatCategories.map((cat) => {
          return {
            value: cat._id,
            label: cat.name,
          };
        });
        // Sắp xếp theo label
        categoryOptions.sort((a, b) => b.label.localeCompare(a.label));
        setCategories(categoryOptions);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Lỗi khi tải danh mục");
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
