// src/admin/components/EditCategoryForm.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState, ChangeEvent, useEffect } from "react";

interface Category {
  id: string;
  name: string;
  description: string;
  image?: string;
}

interface EditCategoryFormProps {
  category: Category;
}

export default function EditCategoryForm({
  category: initialCategory,
}: EditCategoryFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<Category>({
    id: initialCategory.id,
    name: initialCategory.name,
    description: initialCategory.description,
    image: initialCategory.image,
  });
  const [newImage, setNewImage] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialCategory) {
      setFormData({
        id: initialCategory.id,
        name: initialCategory.name,
        description: initialCategory.description,
        image: initialCategory.image,
      });
      setLoading(false);
    } else {
      setError("Không tìm thấy danh mục.");
      setLoading(false);
    }
  }, [initialCategory]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setNewImage(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Giả lập API call để cập nhật danh mục
      console.log("Cập nhật danh mục:", { ...formData, newImage });
      alert("Cập nhật danh mục thành công!");
      router.push("/admin/category");
    } catch (err) {
      console.error("Lỗi khi cập nhật danh mục:", err);
      alert("Có lỗi xảy ra khi cập nhật danh mục.");
    }
  };

  if (loading) {
    return <div className="sk-chase">
  <div className="sk-chase-dot"></div>
  <div className="sk-chase-dot"></div>
  <div className="sk-chase-dot"></div>
  <div className="sk-chase-dot"></div>
  <div className="sk-chase-dot"></div>
  <div className="sk-chase-dot"></div>
</div>
;
  }

  if (error) {
    return <div className="text-center text-lg text-red-500">{error}</div>;
  }

  return (
    <div className="w-full h-full mx-auto bg-white rounded-[2.125rem] px-12 py-8">
      <h2 className="text-[2rem] font-bold mb-6 text-center">Sửa danh mục</h2>

      {/* Form sửa danh mục */}
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
          {formData.image && (
            <p className="text-sm text-gray-500 mt-2 text-center">
              Ảnh hiện tại: {formData.image}
            </p>
          )}
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
            Cập nhật danh mục
          </button>
        </div>
      </form>
    </div>
  );
}
