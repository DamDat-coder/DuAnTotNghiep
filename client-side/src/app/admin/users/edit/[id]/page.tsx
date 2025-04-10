// app/admin/users/edit/[id]/page.tsx
import AdminLayout from "@/admin/layouts/AdminLayout";
import EditUserForm from "@/admin/components/Admin_User/EditUserForm";
import { IUser } from "@/services/api";

async function fetchUser(id: string) {
  try {
    const response = await fetch(
      `https://67e0f65058cc6bf785238ee0.mockapi.io/user/${id}`,
      { cache: "no-store" }
    );
    if (!response.ok) throw new Error("Không thể tải thông tin người dùng.");
    const data: IUser = await response.json();
    // Đảm bảo role hợp lệ
    if (data.role !== "admin" && data.role !== "user") {
      data.role = "user";
    }
    return { user: data, error: null };
  } catch (err) {
    return { user: null, error: "Có lỗi xảy ra khi tải thông tin người dùng." };
  }
}

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, error } = await fetchUser(id);

  if (error || !user) {
    return (
      <AdminLayout
        pageTitle={`Sửa người dùng #${id}`}
        pageSubtitle="Chỉnh sửa thông tin người dùng."
      >
        <div className="text-center text-lg text-red-500">
          {error || "Không tìm thấy người dùng."}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      pageTitle={`Sửa người dùng #${id}`}
      pageSubtitle="Chỉnh sửa thông tin người dùng."
    >
      <EditUserForm user={user} userId={id} />
    </AdminLayout>
  );
}