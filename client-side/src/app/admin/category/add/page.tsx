// app/admin/category/add/page.tsx
"use client";

import AdminLayout from "@/admin/layouts/AdminLayout";
import AddCategoryForm from "@/admin/components/AddCategoryForm";

export default function AddCategoryPage() {
  return (
    <AdminLayout pageTitle="Thêm danh mục" pageSubtitle="Tạo danh mục mới.">
      <AddCategoryForm />
    </AdminLayout>
  );
}