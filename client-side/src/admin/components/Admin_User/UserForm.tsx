// src/admin/components/UserForm.tsx
"use client";

import { useRouter } from "next/navigation"; // Sửa import từ next/router thành next/navigation

interface UserFormProps {
  formData: { email: string; phone: string; role: "admin" | "user" | "" };
  error: string | null;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isEdit?: boolean;
}

export default function UserForm({
  formData,
  error,
  handleChange,
  handleSubmit,
  isEdit = false,
}: UserFormProps) {
  const router = useRouter();

  return (
    <div className="w-full h-full mx-auto bg-white rounded-[2.125rem] px-12 py-8">
      <h2 className="text-[2rem] font-bold mb-6 text-center">
        {isEdit ? "Sửa người dùng" : "Thêm người dùng"}
      </h2>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="w-[60%] mx-auto flex flex-col gap-4">
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

        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Số điện thoại</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Nhập số điện thoại"
            className="w-full mx-auto block p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full mx-auto block p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500 transition-colors"
            required
          >
            <option value="" disabled>
              Chọn role
            </option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>

        <div className="flex justify-center mt-8 gap-4">
          <button
            type="button"
            onClick={() => router.push("/admin/users")}
            className="px-6 py-2 w-full bg-gray-300 text-black font-semibold rounded-md hover:bg-gray-400 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-6 py-2 w-full bg-black text-white font-semibold rounded-md hover:opacity-80 transition-opacity"
          >
            {isEdit ? "Cập nhật" : "Thêm người dùng"}
          </button>
        </div>
      </form>
    </div>
  );
}