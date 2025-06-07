"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/services/api";
import { IUser } from "@/types/auth";

interface UseUserFormProps {
  initialData?: IUser; // Optional
  isEdit: boolean;
  userId?: string;
}

export function useUserForm({ initialData, isEdit, userId }: UseUserFormProps) {
  const [formData, setFormData] = useState({
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    role: initialData && ["admin", "user"].includes(initialData.role)
      ? initialData.role
      : ("" as "admin" | "user" | ""),
  });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!["admin", "user", ""].includes(formData.role)) {
      setError("Vai trò không hợp lệ.");
      return;
    }

    try {
      if (isEdit && userId) {
        await fetchWithAuth(`/users/${userId}`, {
          method: "PUT", // Hoặc thử PATCH nếu 404
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        router.push("/admin/users");
      } else {
        await fetchWithAuth(`/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        router.push("/admin/users");
      }
    } catch (err) {
      console.error("Error submitting user form:", err);
      setError(
        err instanceof Error ? err.message : "Có lỗi xảy ra khi lưu thông tin người dùng."
      );
    }
  };

  return { formData, error, handleChange, handleSubmit };
}