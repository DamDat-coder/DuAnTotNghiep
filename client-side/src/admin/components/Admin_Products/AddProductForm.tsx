// src/admin/components/Admin_Products/AddProductForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IProduct } from "@/types";
import { fetchCategories, addProduct } from "@/services/api";

// Định nghĩa kiểu dữ liệu cho danh mục
interface ICategory {
  id: string;
  name: string;
  description: string;
  img: string;
  parentId: string | null;
}

export default function AddProductForm() {
  const router = useRouter();

  const [formData, setFormData] = useState<IProduct>({
    id: "",
    name: "",
    categoryId: "",
    category: "",
    price: 0,
    discountPercent: 0,
    image: [],
  });
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

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
    const { name, value, files } = e.target as HTMLInputElement;
    if (name === "image" && files) {
      const newFiles = Array.from(files);
      setImageFiles(newFiles);
      setFormData((prev) => ({
        ...prev,
        image: newFiles.map((file) => file.name), // Lưu tên file tạm thời
      }));
    } else if (name === "price" || name === "discountPercent") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? 0 : Number(value),
      }));
    } else if (name === "categoryId") {
      const selectedCategory = categories.find((cat) => cat.id === value);
      setFormData((prev) => ({
        ...prev,
        categoryId: value,
        category: selectedCategory?.name || "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name || formData.image.length === 0 || !formData.categoryId) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc (Tên, Ảnh, Danh mục).");
      return;
    }

    if (formData.price < 0) {
      setError("Giá sản phẩm không được nhỏ hơn 0.");
      return;
    }

    if (formData.discountPercent < 0 || formData.discountPercent > 100) {
      setError("Phần trăm giảm giá phải từ 0 đến 100.");
      return;
    }

    try {
      // Chuẩn bị dữ liệu
      const productData = {
        name: formData.name,
        categoryId: formData.categoryId,
        price: formData.price,
        discountPercent: formData.discountPercent,
        image: formData.image,
      };

      // Gọi API
      await addProduct(productData);
      alert("Thêm sản phẩm thành công!");
      router.push("/admin/products");
    } catch (err: any) {
      console.error("Add product error:", err);
      if (err.message.includes("403")) {
        setError("Không có quyền thêm sản phẩm. Vui lòng kiểm tra đăng nhập admin.");
      } else {
        setError("Có lỗi xảy ra khi thêm sản phẩm.");
      }
    }
  };

  return (
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
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
            max="100"
            required
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
                  <li key={index}>{img}</li>
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
  );
}