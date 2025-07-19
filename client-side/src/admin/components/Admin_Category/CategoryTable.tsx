"use client";

import { useState, useEffect } from "react";
import CategoryTableWrapper from "./CategoryTableWrapper";
import EditCategoryForm from "./EditCategoryForm";
import { ICategory } from "@/types/category";
import { fetchCategoryTree } from "@/services/categoryApi";

interface CategoryTableProps {
  initialCategories: ICategory[];
  onAddCategory?: () => void;
}

// Chuẩn hóa category từ API
function normalizeCategory(cat: any): ICategory {
  return {
    _id: String(cat._id),
    name: cat.name,
    description: cat.description ?? "",
    parentId: cat.parentId ?? cat.parentid ?? null,
    is_active: typeof cat.is_active === "string" ? cat.is_active === "true" : !!cat.is_active,
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
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null);

  // Hàm reload danh mục từ BE
  const reloadCategories = async () => {
    const data = await fetchCategoryTree();
    setCategories(data.map(normalizeCategory));
  };

  useEffect(() => {
    if (Array.isArray(initialCategories)) {
      setCategories(initialCategories.map(normalizeCategory));
    } else {
      setCategories([]);
    }
  }, [initialCategories]);

  // Lấy object mới nhất mỗi lần show popup sửa bằng _id
  const categoryToEdit = editCategoryId
    ? categories.find(
        c => c._id === editCategoryId
      )
    : null;

  const handleCloseEdit = () => {
    setEditCategoryId(null);
    reloadCategories();
  };

  return (
    <>
      <CategoryTableWrapper
        categories={categories}
        onAddCategory={onAddCategory}
        onEditCategory={cat => setEditCategoryId(cat._id)}
        reloadCategories={reloadCategories}
      />
      {editCategoryId && categoryToEdit && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 max-w-xl w-full relative shadow-lg animate-fadeIn">
            <button
              onClick={handleCloseEdit}
              className="absolute top-2 right-3 text-gray-400 hover:text-gray-700 text-2xl"
            >
              &times;
            </button>
            <EditCategoryForm
              category={categoryToEdit}
              onClose={handleCloseEdit}
              onSuccess={reloadCategories}
            />
          </div>
        </div>
      )}
    </>
  );
}
