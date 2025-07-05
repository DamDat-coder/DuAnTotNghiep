"use client";

import { useState, useEffect } from "react";
import CategoryTableWrapper from "./CategoryTableWrapper";
import EditCategoryForm from "./EditCategoryForm";
import { ICategory } from "@/types/category";

interface CategoryTableProps {
  initialCategories: ICategory[];
  onAddCategory?: () => void;
}

// Hàm normalize category từ bất kỳ API (bạn có thể viết ra riêng nếu muốn dùng ở nhiều nơi)
function normalizeCategory(cat: any): ICategory {
  return {
    _id: cat._id || cat.id,
    name: cat.name,
    description: cat.description ?? "",
    parentId: cat.parentId ?? cat.parentid ?? null,
    children: Array.isArray(cat.children)
      ? cat.children.map(normalizeCategory)
      : [],
  };
}

export default function CategoryTable({
  initialCategories,
  onAddCategory,
}: CategoryTableProps) {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [editCategory, setEditCategory] = useState<ICategory | null>(null);

  useEffect(() => {
    // CHUẨN HÓA dữ liệu về đúng _id, parentId, children...
    if (Array.isArray(initialCategories)) {
      setCategories(initialCategories.map(normalizeCategory));
    } else {
      setCategories([]);
    }
  }, [initialCategories]);

  const handleEditCategory = (cat: ICategory) => {
    setEditCategory(cat);
  };

  return (
    <>
      <CategoryTableWrapper
        categories={categories}
        onAddCategory={onAddCategory}
        onEditCategory={handleEditCategory}
      />
      {editCategory && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 max-w-xl w-full relative shadow-lg animate-fadeIn">
            <button
              onClick={() => setEditCategory(null)}
              className="absolute top-2 right-3 text-gray-400 hover:text-gray-700 text-2xl"
            >
              &times;
            </button>
            <EditCategoryForm
              category={editCategory}
              onClose={() => setEditCategory(null)}
            />
          </div>
        </div>
      )}
    </>
  );
}
