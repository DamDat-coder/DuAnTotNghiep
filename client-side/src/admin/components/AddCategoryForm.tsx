// src/admin/components/AddCategoryForm.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState, ChangeEvent } from "react";

interface CategoryFormData {
  name: string;
  description: string;
  image: File | null;
}

export default function AddCategoryForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    description: "",
    image: null,
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, image: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Giả lập API call để thêm danh mục
      console.log("Thêm danh mục:", formData);
      alert("Thêm danh mục thành công!");
      router.push("/admin/category");
    } catch (err) {
      console.error("Lỗi khi thêm danh mục:", err);
      alert("Có lỗi xảy ra khi thêm danh mục.");
    }
  };

  return (
    <div className="w-full h-full mx-auto bg-white rounded-[2.125rem] px-12 py-8">
      <h2 className="text-[2rem] font-bold mb-6 text-center">Thêm danh mục</h2>

      {/* Form thêm danh mục */}
      <form
        onSubmit={handleSubmit}
        className="w-[50%] mx-auto flex flex-col gap-4"
      >
        {/* Tên danh mục */}
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Tên danh mục
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Nhập tên danh mục"
            className="w-full mx-auto block p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Mô tả danh mục */}
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Mô tả danh mục
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Nhập mô tả danh mục"
            className="w-full mx-auto block p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            required
          />
        </div>

        {/* Ảnh danh mục */}
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Ảnh danh mục
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full mx-auto block p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Nút hành động */}
        <div className="flex justify-center mt-8 gap-4">
          <button
            type="button"
            onClick={() => router.push("/admin/category")}
            className="px-6 py-2 w-full bg-gray-300 text-black font-semibold rounded-md hover:bg-gray-400 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-6 py-2 w-full bg-black text-white font-semibold rounded-md hover:opacity-80 transition-opacity"
          >
            Thêm danh mục
          </button>
        </div>
      </form>
    </div>
  );
}
