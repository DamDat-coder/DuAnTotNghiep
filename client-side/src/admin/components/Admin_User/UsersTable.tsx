// src/admin/components/UsersTable.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminNavigation from "../AdminNavigation";
import { fetchWithAuth } from "@/services/api";
import { IUser } from "@/types/auth";
// Định nghĩa kiểu dữ liệu cho cấu hình sắp xếp
interface SortConfig {
  key: "email";
  direction: "asc" | "desc";
}

interface UsersTableProps {
  initialUsers: IUser[];
  navigationItems: { label: string; href: string; filter?: string }[];
  addButton: { label: string; href: string };
}

export default function UsersTable({ initialUsers, navigationItems, addButton }: UsersTableProps) {
  const router = useRouter();

  // State cho dữ liệu người dùng, sắp xếp và lọc
  const [users, setUsers] = useState<IUser[]>(initialUsers);
  const [filteredUsers, setFilteredUsers] = useState<IUser[]>(initialUsers);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [filterRole, setFilterRole] = useState<string>("Tất cả");

  // Hàm lọc dữ liệu dựa trên role
  const handleFilter = (role: string) => {
    setFilterRole(role);
    if (role === "Tất cả") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter((user) => user.role === role);
      setFilteredUsers(filtered);
    }
  };

  // Hàm sắp xếp
  const handleSort = (key: "email") => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    const sortedUsers = [...filteredUsers].sort((a, b) => {
      if (key === "email") {
        return direction === "asc"
          ? a.email.localeCompare(b.email)
          : b.email.localeCompare(a.email);
      }
      return 0;
    });

    setFilteredUsers(sortedUsers);
    setSortConfig({ key, direction });
  };

  // Hàm chỉnh sửa
  const handleEdit = (userId: string) => {
    router.push(`/admin/users/edit/${userId}`);
  };

  // Hàm xóa
  const handleDelete = async (userId: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      try {
        await fetchWithAuth(`http://localhost:3000/users/delete/${userId}`, {
          method: "DELETE",
        });
        const updatedUsers = users.filter((user) => user.id !== userId);
        setUsers(updatedUsers);
        setFilteredUsers(
          updatedUsers.filter((user) =>
            filterRole === "Tất cả" ? true : user.role === filterRole
          )
        );
        alert("Xóa người dùng thành công!");
      } catch (err) {
        console.error("Error deleting user:", err);
        alert("Có lỗi xảy ra khi xóa người dùng.");
      }
    }
  };
  

  return (
    <>
      {/* Container 1: AdminNavigation */}
      <AdminNavigation
        items={navigationItems}
        currentFilter={filterRole}
        onFilter={handleFilter}
        addButton={addButton}
      />

      {/* Container 2: Bảng người dùng */}
      <div className="flex-1 rounded-[2.125rem] px-12 py-8 bg-white overflow-x-auto overflow-y-auto">
        <table className="w-full">
          <thead className="sticky -top-10 bg-white shadow-sm z-10 border-b border-gray-200">
            <tr className="text-center">
              <th className="py-4 px-6 text-base font-medium">STT</th>
              <th className="py-4 px-6 text-base font-medium">
                <button
                  onClick={() => handleSort("email")}
                  className="flex items-center gap-2 mx-auto"
                >
                  Email
                  <span>
                    {sortConfig?.key === "email" && sortConfig.direction === "desc"
                      ? "↓"
                      : "↑"}
                  </span>
                </button>
              </th>
              <th className="py-4 px-6 text-base font-medium">Số điện thoại</th>
              <th className="py-4 px-6 text-base font-medium">Role</th>
              <th className="py-4 px-6 text-base font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, index) => (
              <tr key={user.id} className="hover:bg-gray-50 text-center">
                <td className="py-4 px-6 text-base font-bold">{index + 1}</td>
                <td className="py-4 px-6 text-base font-bold">{user.email}</td>
                <td className="py-4 px-6 text-base font-bold">{user.phone}</td>
                <td className="py-4 px-6 text-base font-medium">{user.role}</td>
                <td className="py-4 px-6">
                  <div className="w-full flex gap-4 justify-center items-center">
                    <button
                      onClick={() => handleEdit(user.id)}
                      className="px-4 py-2 bg-white text-black border border-black rounded-full hover:bg-gray-100"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="px-4 py-2 bg-white text-black border border-black rounded-full hover:bg-gray-100"
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}