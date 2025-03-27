// app/admin/users/page.tsx
"use client";

import AdminLayout from "@/admin/layouts/AdminLayout";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Định nghĩa kiểu dữ liệu cho người dùng
interface User {
  id: number;
  username: string;
  phone: string;
  createdAt: string;
  role: "Admin" | "Người dùng";
}

// Định nghĩa kiểu dữ liệu cho cấu hình sắp xếp
interface SortConfig {
  key: "username" | "createdAt";
  direction: "asc" | "desc";
}

// Dữ liệu mẫu
const sampleUsers: User[] = [
  { id: 1, username: "Nguyễn Văn A", phone: "0901234567", createdAt: "2025-03-25", role: "Admin" },
  { id: 2, username: "Trần Thị B", phone: "0912345678", createdAt: "2025-03-24", role: "Người dùng" },
  { id: 3, username: "Lê Văn C", phone: "0923456789", createdAt: "2025-03-23", role: "Người dùng" },
  { id: 4, username: "Phạm Thị D", phone: "0934567890", createdAt: "2025-03-22", role: "Admin" },
  { id: 5, username: "Hoàng Văn E", phone: "0945678901", createdAt: "2025-03-21", role: "Người dùng" },
  { id: 6, username: "Ngô Thị F", phone: "0956789012", createdAt: "2025-03-20", role: "Người dùng" },
  { id: 7, username: "Đinh Văn G", phone: "0967890123", createdAt: "2025-03-19", role: "Admin" },
  { id: 8, username: "Bùi Thị H", phone: "0978901234", createdAt: "2025-03-18", role: "Người dùng" },
  { id: 9, username: "Vũ Văn I", phone: "0989012345", createdAt: "2025-03-17", role: "Người dùng" },
  { id: 10, username: "Lý Thị K", phone: "0990123456", createdAt: "2025-03-16", role: "Admin" },
];

export default function UsersPage() {
  const router = useRouter();

  // Navigation items (giống trang Đơn hàng)
  const navigationItems = [
    { label: "Tất cả", href: "/admin/users", filter: "Tất cả" },
    { label: "Admin", href: "/admin/users/admin", filter: "Admin" },
    { label: "Người dùng", href: "/admin/users/customer", filter: "Người dùng" },
  ];

  // State cho dữ liệu người dùng, sắp xếp và lọc
  const [users, setUsers] = useState<User[]>(sampleUsers);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(sampleUsers);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [filterRole, setFilterRole] = useState<string>("Tất cả");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Giả lập fetch dữ liệu
  useEffect(() => {
    setLoading(true);
    setUsers(sampleUsers);
    setFilteredUsers(sampleUsers);
    setLoading(false);
  }, []);

  // Hàm lọc dữ liệu dựa trên role
  const handleFilter = (role: string) => {
    setFilterRole(role);
    if (role === "Tất cả") {
      setFilteredUsers(users); // Sử dụng state `users` để đảm bảo dữ liệu gốc không bị thay đổi
    } else {
      const filtered = users.filter((user) => user.role === role);
      setFilteredUsers(filtered);
    }
  };

  // Hàm sắp xếp
  const handleSort = (key: "username" | "createdAt") => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    const sortedUsers = [...filteredUsers].sort((a, b) => {
      if (key === "username") {
        return direction === "asc"
          ? a.username.localeCompare(b.username)
          : b.username.localeCompare(a.username);
      }
      if (key === "createdAt") {
        return direction === "asc"
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0;
    });

    setFilteredUsers(sortedUsers);
    setSortConfig({ key, direction });
  };

  // Hàm chỉnh sửa
  const handleEdit = (userId: number) => {
    router.push(`/admin/users/edit/${userId}`);
  };

  // Hàm xoá
  const handleDelete = (userId: number) => {
    if (confirm("Bạn có chắc chắn muốn xoá người dùng này?")) {
      const updatedUsers = users.filter((user) => user.id !== userId);
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers.filter((user) => (filterRole === "Tất cả" ? true : user.role === filterRole)));
      alert("Xoá người dùng thành công!");
    }
  };

  return (
    <AdminLayout
      pageTitle="Người dùng"
      pageSubtitle="Quản lý người dùng."
      navigationItems={navigationItems}
      addButton={{ label: "Thêm người dùng", href: "/admin/users/add" }}
      onFilter={handleFilter}
    >
      <div className="users-page w-full mx-auto bg-white rounded-[2.125rem] px-12 py-8 h-full flex flex-col">
        {/* Bảng người dùng */}
        <div className="flex-1 overflow-x-auto overflow-y-auto">
          {loading ? (
            <p className="text-center text-lg">Đang tải...</p>
          ) : error ? (
            <p className="text-center text-lg text-red-500">{error}</p>
          ) : (
            <table className="w-full">
              <thead className="sticky -top-2 bg-white shadow-sm z-10 border-b border-gray-200">
                <tr className="text-center">
                  <th className="py-4 px-6 text-base font-medium">STT</th>
                  <th className="py-4 px-6 text-base font-medium">
                    <button onClick={() => handleSort("username")} className="flex items-center gap-2 mx-auto">
                      Tên người dùng
                      <span>{sortConfig?.key === "username" && sortConfig.direction === "desc" ? "↓" : "↑"}</span>
                    </button>
                  </th>
                  <th className="py-4 px-6 text-base font-medium">Số điện thoại</th>
                  <th className="py-4 px-6 text-base font-medium">
                    <button onClick={() => handleSort("createdAt")} className="flex items-center gap-2 mx-auto">
                      Ngày tạo
                      <span>{sortConfig?.key === "createdAt" && sortConfig.direction === "desc" ? "↓" : "↑"}</span>
                    </button>
                  </th>
                  <th className="py-4 px-6 text-base font-medium">Role</th>
                  <th className="py-4 px-6 text-base font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr key={user.id} className="hover:bg-gray-50 text-center">
                    <td className="py-4 px-6 text-base font-bold">{index + 1}</td>
                    <td className="py-4 px-6 text-base font-bold">{user.username}</td>
                    <td className="py-4 px-6 text-base font-bold">{user.phone}</td>
                    <td className="py-4 px-6 text-base font-bold">{user.createdAt}</td>
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
                          Xoá
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}