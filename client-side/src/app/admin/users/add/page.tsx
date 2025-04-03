// app/admin/users/add/page.tsx
"use client";

import AdminLayout from "@/admin/layouts/AdminLayout";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddUserPage() {
  const router = useRouter();

  // State cho form
  const [formData, setFormData] = useState({
    email: "",
    "số điện thoại": "",
    role: "" as "admin" | "user" | "", // Chỉ giữ admin và user
  });
  const [error, setError] = useState<string | null>(null);

  // Hàm xử lý thay đổi input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Hàm xử lý submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.email || !formData["số điện thoại"] || !formData.role) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    try {
      const response = await fetch("https://67e0f65058cc6bf785238ee0.mockapi.io/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Không thể thêm người dùng.");
      alert("Thêm người dùng thành công!");
      router.push("/admin/users");
    } catch (err) {
      setError("Có lỗi xảy ra khi thêm người dùng.");
    }
  };

  return (
    <AdminLayout
      pageTitle="Thêm người dùng"
      pageSubtitle="Tạo người dùng mới."
    >
      <div className="add-user-page h-full w-full mx-auto bg-white rounded-[2.125rem] px-12 py-8">
        <h2 className="text-[2rem] font-bold mb-6 text-center">Thêm người dùng</h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* Form thêm người dùng */}
        <form onSubmit={handleSubmit} className="w-[50%] mx-auto flex flex-col gap-4">
          {/* Email */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Nhập email"
              className="w-full mx-auto block p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Số điện thoại */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Số điện thoại</label>
            <input
              type="tel"
              name="số điện thoại"
              value={formData["số điện thoại"]}
              onChange={handleChange}
              placeholder="Nhập số điện thoại"
              className="w-full mx-auto block p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full mx-auto block p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black text-gray-500 transition-colors"
              required
            >
              <option value="" className="opacity-60" disabled>
                Chọn role
              </option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>

          {/* Nút Thêm */}
          <div className="flex justify-center mt-8">
            <button
              type="submit"
              className="px-6 py-2 w-full bg-black text-white font-semibold rounded-md hover:opacity-80 transition-opacity"
            >
              Thêm người dùng
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}