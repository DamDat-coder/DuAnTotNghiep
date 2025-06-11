"use client";

import { useState } from "react";
import Image from "next/image";

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
}

export default function UserManagementTable({
  initialUsers,
}: {
  initialUsers: User[];
}) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("Tất cả");

  const filteredUsers = users.filter((user) => {
    const matchRole = filterRole === "Tất cả" || user.role === filterRole;
    const matchSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const toggleUserStatus = (id: number) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id ? { ...user, isActive: !user.isActive } : user
      )
    );
  };

  return (
    <div className="p-8 bg-[#F7F9FB] min-h-screen">
      {/* Filter & Search */}
      <div className="flex items-center gap-4 mb-4">
        <select
          className="px-4 py-2 border rounded-md"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        >
          <option value="Tất cả">Tất cả</option>
          <option value="Admin">Admin</option>
          <option value="User">User</option>
        </select>
        <input
          type="text"
          placeholder="Tìm kiếm người dùng..."
          className="px-4 py-2 border rounded-md w-full max-w-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-auto">
        <table className="w-full table-auto text-sm">
          <thead className="bg-[#F0F3F7]">
            <tr className="text-left">
              <th className="px-6 py-3">STT</th>
              <th className="px-6 py-3">Họ và tên</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">SDT</th>
              <th className="px-6 py-3">Vai trò</th>
              <th className="px-6 py-3">Trạng thái</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, index) => (
              <tr key={user.id} className="border-b">
                <td className="px-6 py-4">{index + 1}</td>
                <td className="px-6 py-4">{user.name}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">{user.phone}</td>
                <td className="px-6 py-4">{user.role}</td>
                <td className="px-6 py-4">
                  <span className="sr-only">Toggle Status</span>
                  <span
                    className={`${
                      user.isActive ? "translate-x-6" : "translate-x-1"
                    } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                  />
                </td>
                <td className="px-6 py-4 text-right">...</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-between items-center p-4 border-t">
          <div className="text-sm text-gray-500">Hiển thị 1 - 10</div>
          <div className="flex gap-1">
            {[1, 2, 3, "...", 50].map((page, i) => (
              <button
                key={i}
                className={`px-3 py-1 rounded-md text-sm ${
                  page === 1 ? "bg-black text-white" : "text-black bg-gray-100"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
