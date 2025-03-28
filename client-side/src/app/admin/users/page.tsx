// app/admin/users/page.tsx
"use client";

import AdminLayout from "@/admin/layouts/AdminLayout";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchUsers, User } from "@/services/api"; // Import fetchUsers và User type

// Định nghĩa kiểu dữ liệu cho cấu hình sắp xếp
interface SortConfig {
  key: "email";
  direction: "asc" | "desc";
}

export default function UsersPage() {
  const router = useRouter();

  // Navigation items (chỉ giữ Admin và User)
  const navigationItems = [
    { label: "Tất cả", href: "/admin/users", filter: "Tất cả" },
    { label: "Admin", href: "/admin/users/admin", filter: "admin" },
    { label: "User", href: "/admin/users/user", filter: "user" },
  ];

  // State cho dữ liệu người dùng, sắp xếp và lọc
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [filterRole, setFilterRole] = useState<string>("Tất cả");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dữ liệu người dùng từ API
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const fetchedUsers = await fetchUsers();
        // Lọc bỏ các user có role không hợp lệ (nếu có)
        const validUsers = fetchedUsers.filter((user: { role: string; }) => user.role === "admin" || user.role === "user");
        setUsers(validUsers);
        setFilteredUsers(validUsers);
      } catch (err) {
        setError("Có lỗi xảy ra khi tải dữ liệu người dùng.");
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

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

  // Hàm xoá
  const handleDelete = async (userId: string) => {
    if (confirm("Bạn có chắc chắn muốn xoá người dùng này?")) {
      try {
        const response = await fetch(`https://67e0f65058cc6bf785238ee0.mockapi.io/user/${userId}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Không thể xoá người dùng.");
        const updatedUsers = users.filter((user) => user.id !== userId);
        setUsers(updatedUsers);
        setFilteredUsers(updatedUsers.filter((user) => (filterRole === "Tất cả" ? true : user.role === filterRole)));
        alert("Xoá người dùng thành công!");
      } catch (err) {
        setError("Có lỗi xảy ra khi xoá người dùng.");
      }
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
                    <button onClick={() => handleSort("email")} className="flex items-center gap-2 mx-auto">
                      Email
                      <span>{sortConfig?.key === "email" && sortConfig.direction === "desc" ? "↓" : "↑"}</span>
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
                    <td className="py-4 px-6 text-base font-bold">{user["số điện thoại"]}</td>
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