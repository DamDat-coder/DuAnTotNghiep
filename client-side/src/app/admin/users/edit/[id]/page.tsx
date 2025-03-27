// app/admin/users/edit/[id]/page.tsx
"use client";

import AdminLayout from "@/admin/layouts/AdminLayout";
import { use } from "react";

// Định nghĩa kiểu dữ liệu cho người dùng
interface User {
  id: string;
  email: string;
  phone: string;
  role: "Admin" | "Người dùng";
}

// Dữ liệu giả lập
const getUserById = (id: string): User => {
  return {
    id,
    email: `user${id}@example.com`,
    phone: `090${id.padStart(7, "0")}`,
    role: id === "1" ? "Admin" : "Người dùng",
  };
};

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const user = getUserById(id);

  return (
    <AdminLayout
      pageTitle={`Sửa người dùng #${id}`}
      pageSubtitle="Chỉnh sửa thông tin người dùng."

    >
      <div className="edit-user-page w-full mx-auto bg-white rounded-[2.125rem] px-12 py-8">
        <h2 className="text-[2rem] font-bold mb-6 text-center">Sửa người dùng</h2>

        {/* Form sửa người dùng */}
        <div className="w-[50%] mx-auto flex flex-col gap-4">
          {/* Email */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              defaultValue={user.email}
              className="w-full mx-auto block p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Số điện thoại */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Số điện thoại</label>
            <input
              type="tel"
              defaultValue={user.phone}
              className="w-full mx-auto block p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Role</label>
            <select
              defaultValue={user.role}
              className="w-full mx-auto block p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500 hover:bg-black hover:text-white transition-colors"
            >
              <option value="" disabled>
                Chọn role
              </option>
              <option value="Admin">Admin</option>
              <option value="Người dùng">Người dùng</option>
            </select>
          </div>

          {/* Nút Cập nhật */}
          <div className="flex justify-center mt-8">
            <button
              className="px-6 py-2 w-full bg-black text-white font-semibold rounded-md hover:opacity-80 transition-opacity"
            >
              Cập nhật
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}