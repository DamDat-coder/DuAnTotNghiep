// app/admin/dashboard/page.tsx
import AdminLayout from "@/admin/layouts/AdminLayout";

export default function DashboardPage() {
  return (
    <AdminLayout pageTitle="Dashboard" pageSubtitle="Đây là trang tổng quan.">
      <div>
        <h2>Dashboard Admin</h2>
        <p>Đây là trang tổng quan.</p>
      </div>
    </AdminLayout>
  );
}