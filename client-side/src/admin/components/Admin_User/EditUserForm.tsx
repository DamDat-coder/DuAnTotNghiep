// src/admin/components/EditUserForm.tsx
"use client";

import { useUserForm } from "@/hooks/useUserForm";
import UserForm from "./UserForm";
import { IUser } from "@/services/api";

interface EditUserFormProps {
  user: IUser;
  userId: string;
}

export default function EditUserForm({ user, userId }: EditUserFormProps) {
  const { formData, error, handleChange, handleSubmit } = useUserForm({
    initialData: user,
    isEdit: true,
    userId,
  });

  return (
    <UserForm
      formData={formData}
      error={error}
      handleChange={handleChange}
      handleSubmit={handleSubmit}
      isEdit
    />
  );
}