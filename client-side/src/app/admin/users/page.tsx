import AdminLayout, { NavigationItem } from "@/admin/layouts/AdminLayout";
import { fetchAllUsers } from "@/services/userApi";
import UsersTable from "@/admin/components/Admin_User/UsersTable";

async function fetchUsersData() {
  try {
    const fetchedUsers = await fetchAllUsers();
    // Kiểm tra fetchedUsers không phải null
    const validUsers = fetchedUsers
      ? fetchedUsers.filter(
          (user) => user.role === "admin" || user.role === "user"
        )
      : [];
    return { users: validUsers, error: null };
  } catch (err) {
    return { users: [], error: "Có lỗi xảy ra khi tải dữ liệu người dùng." };
  }
}

export default async function UsersPage() {
  const { users, error } = await fetchUsersData();

  const navigationItems: NavigationItem[] = [
    { label: "Tất cả", href: "/admin/users", filter: "Tất cả" },
    { label: "Admin", href: "/admin/users/admin", filter: "admin" },
    { label: "User", href: "/admin/users/user", filter: "user" },
  ];

  return (
    <AdminLayout pageTitle="Người dùng" pageSubtitle="Quản lý người dùng.">
      <div className="users-page w-full mx-auto h-full flex flex-col">
        {error ? (
          <p className="text-center text-lg text-red-500">{error}</p>
        ) : (
          <UsersTable
            initialUsers={users}
            navigationItems={navigationItems}
            addButton={{ label: "Thêm người dùng", href: "/admin/users/add" }}
          />
        )}
      </div>
    </AdminLayout>
  );
}