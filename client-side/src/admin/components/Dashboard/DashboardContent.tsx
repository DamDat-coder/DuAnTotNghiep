// src/admin/components/DashboardContent.tsx
"use client";

import { useState } from "react";
import AdminNavigation from "../AdminNavigation";
import UserRoleChart from "./UserRoleChart";
import UserRegistrationChart from "./UserRegistrationChart";
import { IUser } from "@/services/api";

interface DashboardContentProps {
  users: IUser[];
  navigationItems: { label: string; href: string; filter?: string }[];
}

export default function DashboardContent({ users, navigationItems }: DashboardContentProps) {
  const [filter, setFilter] = useState<string>("Tất cả");

  const filteredUsers = users.filter((user) => {
    if (filter === "Tất cả") return true;
    return user.role === filter.toLowerCase();
  });

  return (
    <>
      <AdminNavigation
        items={navigationItems}
        currentFilter={filter}
        onFilter={setFilter}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <UserRoleChart users={filteredUsers} />
        <UserRegistrationChart />
      </div>
    </>
  );
}