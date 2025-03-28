// app/admin/users/edit/[id]/page.tsx
"use client";

import AdminLayout from "@/admin/layouts/AdminLayout";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { User } from "@/services/api"; // Import User type

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  // State cho form
  const [formData, setFormData] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Lấy dữ liệu người dùng từ API
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://67e0f65058cc6bf785238ee0.mockapi.io/user/${id}`, {
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Không thể tải thông tin người dùng.");
        const data = await response.json();
        // Đảm bảo role hợp lệ
        if (data.role !== "admin" && data.role !== "user") {
          data.role = "user"; // Mặc định là user nếu role không hợp lệ
        }
        setFormData(data);
      } catch (err) {
        setError("Có lỗi xảy ra khi tải thông tin người dùng.");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  // Hàm xử lý thay đổi input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev!,
      [name]: value,
    }));
  };

  // Hàm xử lý submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch(`https://67e0f65058cc6bf785238ee0.mockapi.io/user/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Không thể cập nhật người dùng.");
      alert("Cập nhật người dùng thành công!");
      router.push("/admin/users");
    } catch (err) {
      setError("Có lỗi xảy ra khi cập nhật người dùng.");
    }
  };

  if (loading) {
    return (
      <AdminLayout
        pageTitle={`Sửa người dùng #${id}`}
        pageSubtitle="Chỉnh sửa thông tin người dùng."
      >
        <div className="text-center text-lg">Đang tải...</div>
      </AdminLayout>
    );
  }

  if (error || !formData) {
    return (
      <AdminLayout
        pageTitle={`Sửa người dùng #${id}`}
        pageSubtitle="Chỉnh sửa thông tin người dùng."
      >
        <div className="text-center text-lg text-red-500">{error || "Không tìm thấy người dùng."}</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      pageTitle={`Sửa người dùng #${id}`}
      pageSubtitle="Chỉnh sửa thông tin người dùng."
    >
      <div className="edit-user-page w-full mx-auto bg-white rounded-[2.125rem] px-12 py-8">
        <h2 className="text-[2rem] font-bold mb-6 text-center">Sửa người dùng</h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* Form sửa người dùng */}
        <form onSubmit={handleSubmit} className="w-[50%] mx-auto flex flex-col gap-4">
          {/* Email */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
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
              className="w-full mx-auto block p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500 hover:bg-black hover:text-white transition-colors"
              required
            >
              <option value="" disabled>
                Chọn role
              </option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>

          {/* Nút Cập nhật */}
          <div className="flex justify-center mt-8">
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