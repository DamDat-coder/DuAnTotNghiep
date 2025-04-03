// app/admin/products/add/page.tsx
"use client";

import AdminLayout from "@/admin/layouts/AdminLayout";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Định nghĩa kiểu dữ liệu cho sản phẩm
interface Product {
  name: string;
  category: string;
  price: number | undefined;
  discountPercent: number | undefined;
  image: string;
  banner: string;
  gender: string;
}

export default function AddProductPage() {
  const router = useRouter();


  // State cho form
  const [formData, setFormData] = useState<Product>({
    name: "",
    category: "Áo",
    price: undefined, // Khởi tạo là undefined thay vì 0
    discountPercent: undefined, // Khởi tạo là undefined thay vì 0
    image: "",
    banner: "",
    gender: "Unisex",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Hàm xử lý thay đổi input text/select
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "price" || name === "discountPercent" ? Number(value) : value,
    }));
  };

  // Hàm xử lý thay đổi file (image/banner)
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "image" | "banner"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === "image") {
        setImageFile(file);
        setFormData((prev) => ({ ...prev, image: file.name }));
      } else {
        setBannerFile(file);
        setFormData((prev) => ({ ...prev, banner: file.name }));
      }
    }
  };

  // Hàm xử lý submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Kiểm tra nếu price hoặc discountPercent là undefined
    if (
      formData.price === undefined ||
      formData.discountPercent === undefined
    ) {
      setError("Vui lòng nhập giá và phần trăm giảm giá.");
      return;
    }

    try {
      // Giả lập upload file và gửi dữ liệu
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("price", formData.price.toString());
      formDataToSend.append(
        "discountPercent",
        formData.discountPercent.toString()
      );
      formDataToSend.append("gender", formData.gender);
      if (imageFile) formDataToSend.append("image", imageFile);
      if (bannerFile) formDataToSend.append("banner", bannerFile);

      // Giả lập API call
      const response = await fetch(
        "https://67e3b0622ae442db76d1204c.mockapi.io/products",
        {
          method: "POST",
          body: formDataToSend,
        }
      );

      if (!response.ok) throw new Error("Không thể thêm sản phẩm.");
      alert("Thêm sản phẩm thành công!");
      router.push("/admin/products/list");
    } catch (err) {
      setError("Có lỗi xảy ra khi thêm sản phẩm.");
    }
  };

  return (
    <AdminLayout
      pageTitle="Thêm sản phẩm"
      pageSubtitle="Thêm sản phẩm mới vào hệ thống."
    >
      <div className="add-product h-full w-full mx-auto bg-white rounded-[2.125rem] px-12 py-8">
        <h2 className="text-[2rem] font-bold mb-6 text-center">
          Thêm sản phẩm
        </h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
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
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Áo">Áo</option>
              <option value="Quần">Quần</option>
              <option value="Giày">Giày</option>
              <option value="Phụ kiện">Phụ kiện</option>
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
              value={formData.price}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              required
              placeholder="0"
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
              value={formData.discountPercent}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              max="100"
              required
              placeholder="0"
            />
          </div>

          {/* Ảnh */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Ảnh
            </label>
            <input
              type="file"
              name="image"
              onChange={(e) => handleFileChange(e, "image")}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              accept="image/*"
              required
            />
            {formData.image && (
              <p className="mt-2 text-sm text-gray-600">
                File đã chọn: {formData.image}
              </p>
            )}
          </div>

          {/* Banner */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Banner
            </label>
            <input
              type="file"
              name="banner"
              onChange={(e) => handleFileChange(e, "banner")}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              accept="image/*"
              required
            />
            {formData.banner && (
              <p className="mt-2 text-sm text-gray-600">
                File đã chọn: {formData.banner}
              </p>
            )}
          </div>

          {/* Giới tính */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Giới tính
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Unisex">Unisex</option>
              <option value="Nam">Nam</option>
            </select>
          </div>

          {/* Nút hành động */}
          <div className="flex justify-end gap-4 mt-8">
            <button
              type="submit"
              className="px-6 py-2 w-full bg-black text-white font-semibold rounded-md hover:opacity-80 transition-opacity"
            >
              Thêm sản phẩm
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
