// app/admin/users/page.tsx
import UserManagementTable from "@/admin/components/Admin_User/UserManagementTable";
import AdminLayout from "@/admin/layouts/AdminLayout";
import { fetchAllUsers } from "@/services/userApi";


async function fetchUsersData() {
  try {
    const fetchedUsers = await fetchAllUsers();
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

  return (
    <AdminLayout
      pageTitle="Người dùng"
      pageSubtitle="Thông tin chi tiết về người dùng của bạn"
    >
      {error ? (
        <p className="text-red-500 text-center mt-4">{error}</p>
      ) : (
        <UserManagementTable initialUsers={users} />
      )}
    </AdminLayout>
  );
}
