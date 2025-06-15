"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/admin/layouts/AdminLayout";
import { fetchAllUsers } from "@/services/userApi";
import TableWrapper from "@/admin/components/Admin_User/TableWrapper";
import UserTableBody from "@/admin/components/Admin_User/UserTableBody";
import { IUser } from "@/types/auth";
import { Pagination } from "@/admin/components/ui/Panigation";

export default function UsersPage() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const loadUsers = async () => {
      const data = await fetchAllUsers();
      setUsers(data ?? []);
    };
    loadUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchFilter = filter === "all" || user.role === filter;
    const matchSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const totalPage = Math.ceil(filteredUsers.length / pageSize);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Reset về trang 1 nếu lọc hoặc tìm kiếm thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, search]);

  return (
    <AdminLayout
      pageTitle="Người dùng"
      pageSubtitle="Quản lý người dùng của bạn"
    >
      <TableWrapper users={users}>
        {(data) => <UserTableBody users={data} />}
      </TableWrapper>

      {/* Pagination */}
      <div className="mt-6 flex justify-center">
        <Pagination
          currentPage={currentPage}
          totalPage={totalPage}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>
    </AdminLayout>
  );
}
