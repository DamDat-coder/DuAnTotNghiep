"use client";
import { useEffect, useState } from "react";
import AdminLayout from "@/admin/layouts/AdminLayout";
import CategoryTable from "@/admin/components/Admin_Category/CategoryTable";
import { fetchCategoryTree } from "@/services/categoryApi";
import type { ICategory } from "@/types/category"; // Import type chuẩn

export default function CategoriesPage() {
  const [categories, setCategories] = useState<ICategory[]>([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategoryTree();
        setCategories(data); // data là ICategory[]
      } catch (error) {
        console.error("Lỗi khi fetch danh mục:", error);
      }
    };

    loadCategories();
  }, []);

  return (
    <AdminLayout pageTitle="Danh mục" pageSubtitle="Quản lý danh mục.">
      <div className="order-page w-full mx-auto h-full flex flex-col">
        <CategoryTable
          initialCategories={categories}
        />
      </div>
    </AdminLayout>
  );
}
