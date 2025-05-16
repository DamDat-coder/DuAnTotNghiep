"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/admin/layouts/AdminLayout";
import { addProduct } from "@/services/productApi";
import { fetchCategories } from "@/services/categoryApi";
import { ICategory } from "@/types";

export default function AddProductPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    category: "",
    price: "",
    discountPercent: "",
    image: [] as File[],
  });
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Lấy danh mục
  useEffect(() => {
    const loadCategories = async () => {
      const fetchedCategories = await fetchCategories();
      console.log("Categories:", fetchedCategories);
      setCategories(fetchedCategories);
      if (fetchedCategories.length > 0) {
        setFormData((prev) => ({
          ...prev,
          categoryId: fetchedCategories[0].id,
          category: fetchedCategories[0].name,
        }));
      }
    };
    loadCategories();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, files } = e.target as any;
    if (name === "image" && files) {
      setFormData((prev) => ({
        ...prev,
        image: Array.from(files) as File[],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        ...(name === "categoryId" && {
          category: categories.find((c) => c.id === value)?.name || "",
        }),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const product = {
        name: formData.name,
        categoryId: formData.categoryId,
        price: parseFloat(formData.price),
        discountPercent: formData.discountPercent
          ? parseFloat(formData.discountPercent)
          : undefined,
        sizes: [],
        images: formData.image,
      };
      const result = await addProduct(product);
      if (result) {
        router.push("/admin/products");
      } else {
        setError("Không thể thêm sản phẩm.");
      }
    } catch (err: any) {
      console.error("Add product error:", err);
      setError("Lỗi khi thêm sản phẩm: " + err.message);
    }
  };

  return (
    <>
      <>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form
          onSubmit={handleSubmit}
          className="space-y-6 w-[60%] mx-auto flex flex-col gap-4"
        >
          {/* Tên sản phẩm */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Tên sản phẩm
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Danh mục */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Danh mục
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {categories.length === 0 ? (
                <option value="">Không có danh mục</option>
              ) : (
                categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Giá sản phẩm */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Giá sản phẩm (VNĐ)
            </label>
            <input
              type="number"
              name="price"
              placeholder="0 VNĐ"
              value={formData.price}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              required
            />
          </div>

          {/* Phần trăm giảm giá */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Phần trăm giảm giá (%)
            </label>
            <input
              type="number"
              name="discountPercent"
              placeholder="0"
              value={formData.discountPercent}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              max="100"
            />
          </div>

          {/* Ảnh */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Ảnh (chọn nhiều file ảnh)
            </label>
            <input
              type="file"
              name="image"
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              accept="image/*"
              multiple
              required
            />
            {formData.image.length > 0 && (
              <div className="mt-2 text-sm text-gray-500">
                <p>File đã chọn:</p>
                <ul className="list-disc list-inside">
                  {formData.image.map((img, index) => (
                    <li key={index}>{img.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Nút hành động */}
          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={() => router.push("/admin/products")}
              className="px-6 py-2 w-full bg-gray-300 text-black font-semibold rounded-md hover:bg-gray-400 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2 w-full bg-black text-white font-semibold rounded-md hover:opacity-80 transition-opacity"
            >
              Thêm sản phẩm
            </button>
          </div>
        </form>
      </>
    </>
  );
}
