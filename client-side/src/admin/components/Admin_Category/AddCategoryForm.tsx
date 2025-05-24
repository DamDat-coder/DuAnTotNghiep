"use client";

import { useRouter } from "next/navigation";
import { useState, ChangeEvent, useEffect } from "react";
import { addCategory, fetchCategories } from "@/services/categoryApi";
import { ICategory } from "@/types/category";

interface CategoryFormData {
  name: string;
  description: string;
  parentId: string | null;
}

export default function AddCategoryForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    description: "",
    parentId: null,
  });
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lấy danh sách danh mục khi component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const fetchedCategories = await fetchCategories();
        setCategories(fetchedCategories);
      } catch (err) {
        console.error("Error loading categories:", err);
        setError("Không thể tải danh mục cha");
      }
    };
    loadCategories();
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await addCategory({
        name: formData.name,
        description: formData.description,
        parentId: formData.parentId || null,
      });
      alert("Thêm danh mục thành công!");
      router.push("/admin/category");
    } catch (err: any) {
      console.error("Lỗi khi thêm danh mục:", err);
      setError(err.message || "Có lỗi xảy ra khi thêm danh mục.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full mx-auto bg-white rounded-[2.125rem] px-12 py-8">
      <h2 className="text-[2rem] font-bold mb-6 text-center">Thêm danh mục</h2>

      {/* Hiển thị lỗi nếu có */}
      {error && (
        <div className="text-red-500 text-center mb-4">{error}</div>
      )}

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
            maxLength={100}
            disabled={isLoading}
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
            disabled={isLoading}
          />
        </div>

        {/* Danh mục cha */}
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Danh mục cha
          </label>
          <select
            name="parentId"
            value={formData.parentId || ""}
            onChange={handleChange}
            className="w-full mx-auto block p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            <option value="">Không có danh mục cha</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Nút hành động */}
        <div className="flex justify-center mt-8 gap-4">
          <button
            type="button"
            onClick={() => router.push("/admin/category")}
            className="px-6 py-2 w-full bg-gray-300 text-black font-semibold rounded-md hover:bg-gray-400 transition-colors"
            disabled={isLoading}
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-6 py-2 w-full bg-black text-white font-semibold rounded-md hover:opacity-80 transition-opacity disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? "Đang xử lý..." : "Thêm danh mục"}
          </button>
        </div>
      </form>
    </div>
  );
}