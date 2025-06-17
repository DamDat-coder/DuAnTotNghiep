"use client";

import { useEffect, useState } from "react";
import { CategoryOption } from "@/types/filter";
import { API_BASE_URL } from "@/services/api";

interface FilterCategoryProps {
  selectedCategory: string | null;
  setSelectedCategory: (value: string | null) => void;
}

interface Category {
  _id: string;
  name: string;
  parentid: string | null;
}

export default function FilterCategory({
  selectedCategory,
  setSelectedCategory,
}: FilterCategoryProps) {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/categories`, {
          cache: "no-store",
        });
        if (!res.ok) {
          throw new Error("Không thể lấy danh mục");
        }
        const data = await res.json();
        // Lọc danh mục có parentid === null và ánh xạ thành CategoryOption
        const rootCategories: CategoryOption[] = data.data
          .filter((cat: Category) => cat.parentid === null)
          .map((cat: Category) => ({
            value: cat._id,
            label: cat.name,
          }));
        // Sắp xếp theo tên (tùy chọn)
        rootCategories.sort((a, b) => a.label.localeCompare(b.label));
        setCategories(rootCategories);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Lỗi khi tải danh mục"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
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