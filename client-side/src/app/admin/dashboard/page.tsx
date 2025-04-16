import AdminLayout, { NavigationItem } from "@/admin/layouts/AdminLayout";
import { fetchAllUsers, IUser } from "@/services/api";
import DashboardContent from "@/admin/components/Dashboard/DashboardContent";

async function fetchDashboardData() {
  try {
    const users = await fetchAllUsers();
    return { users: users || [], error: null }; // Mặc định [] nếu null
  } catch (err) {
    return { users: [], error: "Có lỗi xảy ra khi tải dữ liệu người dùng." };
  }
}

export default async function DashboardPage() {
  const { users, error } = await fetchDashboardData();

  const navigationItems: NavigationItem[] = [
    { label: "Tất cả", href: "#", filter: "Tất cả" },
    { label: "Admin", href: "#", filter: "admin" },
    { label: "User", href: "#", filter: "user" },
  ];

  return (
    <AdminLayout pageTitle="Dashboard" pageSubtitle="Đây là trang tổng quan.">
      <div className="dashboard-page w-full h-auto mx-auto flex flex-col gap-8">
        {error ? (
          <p className="text-center text-lg text-red-500">{error}</p>
        ) : (
          <DashboardContent users={users} navigationItems={navigationItems} />
        )}
      </div>
    </AdminLayout>
  );
}