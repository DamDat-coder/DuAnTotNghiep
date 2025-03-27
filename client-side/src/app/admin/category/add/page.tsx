// app/admin/categories/add/page.tsx
"use client";

import AdminLayout from "@/admin/layouts/AdminLayout";

export default function AddCategoryPage() {

  return (
    <AdminLayout
      pageTitle="Thêm danh mục"
      pageSubtitle="Tạo danh mục mới."
    >
      <div className="add-category-page w-full mx-auto bg-white rounded-[2.125rem] px-12 py-8">
        <h2 className="text-[2rem] font-bold mb-6 text-center">Thêm danh mục</h2>

        {/* Form thêm danh mục */}
        <div className="w-[50%] mx-auto flex flex-col gap-4">
          {/* Tên danh mục */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Tên danh mục</label>
            <input
              type="text"
              placeholder="Nhập tên danh mục"
              className="w-full mx-auto block p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Mô tả danh mục */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Mô tả danh mục</label>
            <textarea
              placeholder="Nhập mô tả danh mục"
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
          </div>

          {/* Nút Thêm */}
          <div className="flex justify-center mt-8">
            <button
              className="px-6 py-2 w-full bg-black text-white font-semibold rounded-md hover:opacity-80 transition-opacity"
              >
              Thêm danh mục
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}