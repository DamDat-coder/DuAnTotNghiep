"use client";

import { useRouter } from "next/navigation";

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
    <div className="w-full max-w-2xl mx-auto bg-white rounded-[2rem] px-8 py-6 shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {isEdit ? "Sửa người dùng" : "Thêm người dùng"}
      </h2>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Nhập email"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Nhập số điện thoại"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
            required
          >
            <option value="" disabled>
              Chọn vai trò
            </option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>

        <div className="flex justify-center mt-6 gap-4">
          <button
            type="button"
            onClick={() => router.push("/admin/users")}
            className="px-4 py-2 w-1/2 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-4 py-2 w-1/2 bg-black text-white font-medium rounded-md hover:bg-gray-800 transition-colors"
          >
            {isEdit ? "Cập nhật" : "Thêm người dùng"}
          </button>
        </div>
      </form>
    </div>
  );
}