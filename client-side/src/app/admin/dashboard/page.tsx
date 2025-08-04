'use client';

import AdminLayout from "@/admin/layouts/AdminLayout";
import DashboardContent from "@/admin/components/Dashboard/DashboardContent";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <AdminLayout pageTitle="Dashboard" pageSubtitle="Đây là trang tổng quan.">
        <div className="dashboard-page w-full h-auto mx-auto flex flex-col gap-8">
          <p className="text-center text-lg text-red-500">
            Vui lòng đăng nhập để sử dụng dashboard.
          </p>
        </div>
      </AdminLayout>
    );
  }

  if (user.role !== "admin") {
    return (
      <AdminLayout pageTitle="Dashboard" pageSubtitle="Đây là trang tổng quan.">
        <div className="dashboard-page w-full h-auto mx-auto flex flex-col gap-8">
          <p className="text-center text-lg text-red-500">
            Bạn không có quyền truy cập dashboard này.
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Dashboard" pageSubtitle="Đây là trang tổng quan.">
      <div className="dashboard-page w-full h-auto mx-auto flex flex-col gap-8">
        <DashboardContent />
      </div>
    </AdminLayout>
  );
}
