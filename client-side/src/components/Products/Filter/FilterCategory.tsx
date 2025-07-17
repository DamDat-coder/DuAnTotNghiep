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

  // Tạo danh sách danh mục cấp cao (parentId = null), trừ "Bài viết"
  const categoryOptions: CategoryOption[] = useMemo(() => {
    if (!flat) return [];

    const excludeId = "684d0f12543e02998d9df097";
    const parentCategories = flat
      .filter(cat => cat.parentId === null && cat._id !== excludeId)
      .map(cat => ({
        value: cat._id,
        label: cat.name,
      }));

    const order = ["Unisex", "Nam", "Nữ"];
    return parentCategories.sort(
      (a, b) => order.indexOf(a.label) - order.indexOf(b.label)
    );
  }, [flat]);

  // Xử lý các trạng thái tải dữ liệu
  if (isLoading) {
    return renderMessage("Đang tải...");
  }

  if (error) {
    return renderMessage(`Lỗi: ${error}`, "text-red-500");
  }

  if (categoryOptions.length === 0) {
    return renderMessage("Không có danh mục nào.");
  }

  function renderMessage(message: string, colorClass = "text-gray-500") {
    return (
      <div className="flex flex-col gap-4 border-b pb-4 mt-4">
        <h3 className="text-base font-bold">Danh mục</h3>
        <p className={`text-sm ${colorClass}`}>{message}</p>
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

        {categoryOptions.map(({ value, label }) => (
          <label
            key={value}
            className="flex items-center gap-2 text-sm cursor-pointer"
          >
            <input
              type="radio"
              name="category"
              value={value}
              checked={selectedCategory === value}
              onChange={() => setSelectedCategory(value)}
              className="h-4 w-4 accent-black focus:ring-black"
            />
            <span>{label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
