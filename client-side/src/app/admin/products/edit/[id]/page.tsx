// app/admin/products/edit/[id]/page.tsx
"use client";

import AdminLayout from "@/admin/layouts/AdminLayout";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Định nghĩa kiểu dữ liệu cho sản phẩm
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  discountPercent: number;
  image: string;
  banner: string;
  gender: string;
}

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();


  // State cho form
  const [formData, setFormData] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Lấy dữ liệu sản phẩm từ API
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://67e3b0622ae442db76d1204c.mockapi.io/products/${params.id}`, {
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Không thể tải thông tin sản phẩm.");
        const data = await response.json();
        setFormData(data);
      } catch (err) {
        setError("Có lỗi xảy ra khi tải thông tin sản phẩm.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [params.id]);

  // Hàm xử lý thay đổi input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev!,
      [name]: name === "price" || name === "discountPercent" ? Number(value) : value,
    }));
  };

  // Hàm xử lý submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch(`https://67e3b0622ae442db76d1204c.mockapi.io/products/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Không thể cập nhật sản phẩm.");
      alert("Cập nhật sản phẩm thành công!");
      router.push("/admin/products/list");
    } catch (err) {
      setError("Có lỗi xảy ra khi cập nhật sản phẩm.");
    }
  };

  if (loading) {
    return (
      <AdminLayout
        pageTitle={`Chỉnh sửa sản phẩm #${params.id}`}
        pageSubtitle="Chỉnh sửa thông tin sản phẩm."

      >
        <div className="text-center text-lg">Đang tải...</div>
      </AdminLayout>
    );
  }

  if (error || !formData) {
    return (
      <AdminLayout
        pageTitle={`Chỉnh sửa sản phẩm #${params.id}`}
        pageSubtitle="Chỉnh sửa thông tin sản phẩm."

      >
        <div className="text-center text-lg text-red-500">{error || "Không tìm thấy sản phẩm."}</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      pageTitle={`Chỉnh sửa sản phẩm #${params.id}`}
      pageSubtitle="Chỉnh sửa thông tin sản phẩm."
    >
      <div className="edit-product h-full w-full mx-auto bg-white rounded-[2.125rem] px-12 py-8">
        <h2 className="text-[2rem] font-bold mb-6 text-center">Chỉnh sửa sản phẩm</h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tên sản phẩm */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Tên sản phẩm</label>
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
            <label className="block text-lg font-medium text-gray-700 mb-2">Danh mục</label>
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
            <label className="block text-lg font-medium text-gray-700 mb-2">Giá sản phẩm (VNĐ)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              required
            />
          </div>

          {/* Phần trăm giảm giá */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Phần trăm giảm giá (%)</label>
            <input
              type="number"
              name="discountPercent"
              value={formData.discountPercent}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              max="100"
              required
            />
          </div>

          {/* Ảnh */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Ảnh (tên file trong /public/featured/)</label>
            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="VD: featured_banner_4.png"
              required
            />
          </div>

          {/* Banner */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Banner (tên file trong /public/featured/)</label>
            <input
              type="text"
              name="banner"
              value={formData.banner}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="VD: featured_banner_1.png"
              required
            />
          </div>

          {/* Giới tính */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Giới tính</label>
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
              Cập nhật
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}