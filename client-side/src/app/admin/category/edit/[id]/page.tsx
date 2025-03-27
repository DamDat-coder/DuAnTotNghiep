// app/admin/categories/edit/[id]/page.tsx
"use client";

import AdminLayout from "@/admin/layouts/AdminLayout";
import { use } from "react";

// Định nghĩa kiểu dữ liệu cho danh mục
interface Category {
  id: string;
  name: string;
  description: string;
  image?: string;
}

// Dữ liệu giả lập
const getCategoryById = (id: string): Category => {
  return {
    id,
    name: `Danh mục ${id}`,
    description: `Mô tả cho danh mục ${id}`,
    image: `category-${id}.jpg`,
  };
};

export default function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const category = getCategoryById(id);


  return (
    <AdminLayout
      pageTitle={`Sửa danh mục #${id}`}
      pageSubtitle="Chỉnh sửa thông tin danh mục."
    >
      <div className="edit-category-page w-full mx-auto bg-white rounded-[2.125rem] px-12 py-8">
        <h2 className="text-[2rem] font-bold mb-6 text-center">Sửa danh mục</h2>

        {/* Form sửa danh mục */}
        <div className="w-[50%] mx-auto flex flex-col gap-4">
          {/* Tên danh mục */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Tên danh mục</label>
            <input
              type="text"
              defaultValue={category.name}
              className="w-full mx-auto block p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Mô tả danh mục */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Mô tả danh mục</label>
            <textarea
              defaultValue={category.description}
              className="w-full mx-auto block p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
          </div>

          {/* Ảnh danh mục */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Ảnh danh mục</label>
            <input
              type="file"
              accept="image/*"
              className="w-full mx-auto block p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {category.image && (
              <p className="text-sm text-gray-500 mt-2 text-center">
                Ảnh hiện tại: {category.image}
              </p>
            )}
          </div>

          {/* Nút Cập nhật */}
          <div className="flex justify-center mt-8">
            <button
              className="px-6 py-2 w-full bg-black text-white font-semibold rounded-md hover:opacity-80 transition-opacity"
              >
              Cập nhật danh mục
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}