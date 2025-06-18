"use client";
import { useState, useEffect } from "react";
import CategoryTableWrapper from "./CategoryTableWrapper";

export interface Category {
  id: string;
  name: string;
  parentId?: string | null;
  // description?: string; // Nếu cần hiển thị mô tả thì bổ sung
}

interface CategoryTableProps {
  initialCategories: Category[];
  onAddCategory?: () => void;
  onEditCategory?: (cat: Category) => void;
}

export default function CategoryTable({
  initialCategories,
  onAddCategory,
  onEditCategory,
}: CategoryTableProps) {
  const [categories, setCategories] = useState<Category[]>([]);

  // Sync dữ liệu khi initialCategories thay đổi
  useEffect(() => {
    setCategories(Array.isArray(initialCategories) ? initialCategories : []);
  }, [initialCategories]);

  return (
    <CategoryTableWrapper
      categories={categories}
      onAddCategory={onAddCategory}
      onEditCategory={onEditCategory}
    />
  );
}
