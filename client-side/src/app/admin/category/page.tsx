"use client";
import { useEffect, useState } from "react";
import AdminLayout from "@/admin/layouts/AdminLayout";
import CategoryTable from "@/admin/components/Admin_Category/CategoryTable";
// import { fetchCategoriesFlat } from "@/services/categoryApi";

interface Category {
  id: string;
  name: string;
  description: string;
  parentId?: string | null;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const navigationItems = [
    { label: "Danh sách danh mục", href: "/admin/category" },
  ];

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategoriesFlat();
        setCategories(data);
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
          navigationItems={navigationItems}
          addButton={{ label: "Thêm danh mục", href: "/admin/category/add" }}
        />
      </div>
    </AdminLayout>
  );
}
