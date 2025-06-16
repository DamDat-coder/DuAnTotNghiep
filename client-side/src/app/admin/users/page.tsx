"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/admin/layouts/AdminLayout";
import { fetchAllUsers } from "@/services/userApi";
import TableWrapper from "@/admin/components/Admin_User/TableWrapper";
import UserTableBody from "@/admin/components/Admin_User/UserTableBody";
import { IUser } from "@/types/auth";

export default function UsersPage() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      const data = await fetchAllUsers();
      setUsers(data);
    };
    loadUsers();
  }, []);

const filteredUsers = users.filter((user) => {
  const matchFilter = filter === "all" || user.role === filter;
  const name = user.name || "";
  const email = user.email || "";
  const matchSearch =
    name.toLowerCase().includes(search.toLowerCase()) ||
    email.toLowerCase().includes(search.toLowerCase());
  return matchFilter && matchSearch;
});


  return (
    <AdminLayout
      pageTitle="Người dùng"
      pageSubtitle="Quản lý người dùng của bạn"
    >
      <TableWrapper
        users={filteredUsers}
        onFilterChange={setFilter}
        onSearchChange={setSearch}
      >
        {(data) => <UserTableBody users={data} />}
      </TableWrapper>
    </AdminLayout>
  );
}
