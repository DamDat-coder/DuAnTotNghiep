// app/admin/users/add/page.tsx
"use client";

import AdminLayout from "@/admin/layouts/AdminLayout";
import UserForm from "@/admin/components/Admin_User/UserForm";
import { useUserForm } from "@/hooks/useUserForm";

export default function AddUserPage() {
  const { formData, error, handleChange, handleSubmit } = useUserForm({});

  return (
    <AdminLayout pageTitle="Thêm người dùng" pageSubtitle="Tạo người dùng mới.">
      <UserForm
        formData={formData}
        error={error}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
      />
    </AdminLayout>
  );
}