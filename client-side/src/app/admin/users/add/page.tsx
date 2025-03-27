// app/admin/users/add/page.tsx
"use client";

import AdminLayout from "@/admin/layouts/AdminLayout";

export default function AddUserPage() {

  return (
    <AdminLayout
      pageTitle="Thêm người dùng"
      pageSubtitle="Tạo người dùng mới."

    >
      <div className="add-user-page w-full mx-auto bg-white rounded-[2.125rem] px-12 py-8">
        <h2 className="text-[2rem] font-bold mb-6 text-center">Thêm người dùng</h2>

        {/* Form thêm người dùng */}
        <div className="w-[50%] mx-auto flex flex-col gap-4">
          {/* Email */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              placeholder="Nhập email"
              className="w-full mx-auto block p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Số điện thoại */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Số điện thoại</label>
            <input
              type="tel"
              placeholder="Nhập số điện thoại"
              className="w-full mx-auto block p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Role</label>
            <select
              defaultValue=""
              className="w-full mx-auto block p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black text-gray-500  transition-colors"
            >
              <option value="" className="opacity-60" disabled>
                Chọn role
              </option>
              <option value="Admin">Admin</option>
              <option value="Người dùng">Người dùng</option>
            </select>
          </div>

          {/* Nút Thêm */}
          <div className="flex justify-center mt-8">
            <button
              className="px-6 py-2 w-full bg-black text-white font-semibold rounded-md hover:opacity-80 transition-opacity"
              >
              Thêm người dùng
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}