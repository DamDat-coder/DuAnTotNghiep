"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/admin/layouts/AdminLayout";
import CategoriesTable from "@/admin/components/Admin_Category/CategoriesTable";
import { fetchCategories } from "@/services/categoryApi";

interface Category {
  id: number;
  name: string;
  description: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);

  const navigationItems = [
    { label: "Danh sách danh mục", href: "/admin/category" },
  ];

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        console.log(data);
        
        setCategories(
          data.map((item: any) => ({
            id: Number(item.id),
            name: item.name,
            description: item.description,
          }))
        );
      } catch (error) {
        console.error("Lỗi khi fetch danh mục:", error);
      }
    };

    loadCategories();
  }, []);

  return (
    <AdminLayout pageTitle="Danh mục" pageSubtitle="Quản lý danh mục.">
      <div className="order-page w-full mx-auto h-full flex flex-col">
        <CategoriesTable
          initialCategories={categories}
          navigationItems={navigationItems}
          addButton={{ label: "Thêm danh mục", href: "/admin/category/add" }}
        />
      </div>
    </AdminLayout>
  );
}
