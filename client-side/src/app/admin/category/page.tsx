// app/admin/category/page.tsx
"use client";

import AdminLayout from "@/admin/layouts/AdminLayout";
import CategoriesTable from "@/admin/components/Admin_Category/CategoriesTable";

// Định nghĩa kiểu dữ liệu cho danh mục
interface Category {
  id: number;
  name: string;
  description: string;
}

// Dữ liệu mẫu
const sampleCategories: Category[] = [
  { id: 1, name: "Áo thun", description: "Danh mục áo thun nam và nữ" },
  { id: 2, name: "Quần jeans", description: "Danh mục quần jeans thời trang" },
  {
    id: 3,
    name: "Giày thể thao",
    description: "Danh mục giày thể thao phong cách",
  },
  { id: 4, name: "Phụ kiện", description: "Danh mục phụ kiện như mũ, kính" },
  { id: 5, name: "Túi xách", description: "Danh mục túi xách thời trang" },
  { id: 6, name: "Đồng hồ", description: "Danh mục đồng hồ cao cấp" },
  { id: 7, name: "Áo khoác", description: "Danh mục áo khoác mùa đông" },
  { id: 8, name: "Váy", description: "Danh mục váy nữ thời trang" },
  { id: 9, name: "Quần short", description: "Danh mục quần short năng động" },
  { id: 10, name: "Kính râm", description: "Danh mục kính râm phong cách" },
];

export default function CategoriesPage() {
  const navigationItems = [
    { label: "Danh sách danh mục", href: "/admin/category" },
  ];

  return (
    <AdminLayout pageTitle="Danh mục" pageSubtitle="Quản lý danh mục.">
      <div className="order-page w-full mx-auto h-full flex flex-col">
        <CategoriesTable
          initialCategories={sampleCategories}
          navigationItems={navigationItems}
          addButton={{ label: "Thêm danh mục", href: "/admin/category/add" }}
        />
      </div>
    </AdminLayout>
  );
}
