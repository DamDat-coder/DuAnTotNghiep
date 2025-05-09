import AdminLayout from "@/admin/layouts/AdminLayout";
import EditUserForm from "@/admin/components/Admin_User/EditUserForm";
import { IUser } from "@/types/index";
import { fetchWithAuth } from "@/services/api";

async function fetchUserById(id: string): Promise<{ user: IUser | null; error: string | null }> {
  try {
    const data = await fetchWithAuth<any>(`http://localhost:3000/users/userinfo/${id}`, {
      cache: "no-store",
    });
    if (!data || !data._id) {
      throw new Error("Dữ liệu user không hợp lệ");
    }
    const user: IUser = {
      id: data._id.$oid || data._id,
      name: data.name || "",
      email: data.email || "",
      phone: data.phone || "",
      avatar: data.avatar || "",
      role: data.role === "admin" || data.role === "user" ? data.role : "user",
    };
    return { user, error: null };
  } catch (err) {
    return {
      user: null,
      error: err instanceof Error ? err.message : "Có lỗi xảy ra khi tải thông tin người dùng.",
    };
  }
}

export default async function UserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, error } = await fetchUserById(id);

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