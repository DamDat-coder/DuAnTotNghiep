"use client";

import { useUserForm } from "@/hooks/useUserForm";
import UserForm from "./UserForm";
import { IUser } from "@/types";

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
      handleSubmit={(e) => {
        console.log("Submitting user update:", { userId, formData });
        handleSubmit(e);
      }}
      isEdit
    />
  );
}