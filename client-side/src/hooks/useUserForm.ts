// src/hooks/useUserForm.ts
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IUser } from "@/services/api";

interface UserFormData {
  email: string;
  phone: string;
  role: "admin" | "user" | "";
}

interface UseUserFormProps {
  initialData?: IUser | null;
  isEdit?: boolean;
  userId?: string;
}

export function useUserForm({
  initialData,
  isEdit = false,
  userId,
}: UseUserFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState<UserFormData>(
    initialData
    ? {
        email: initialData.email,
        phone: initialData.phone,
        role: ["admin", "user"].includes(initialData.role)
          ? (initialData.role as "admin" | "user")
          : "",
      }
    : { email: "", phone: "", role: "" }
  );
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.email || !formData.phone || !formData.role) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    const maxRetries = 3;
    let retries = 0;

    while (retries < maxRetries) {
      try {
        const url = isEdit
          ? `https://67e0f65058cc6bf785238ee0.mockapi.io/user/${userId}`
          : "https://67e0f65058cc6bf785238ee0.mockapi.io/user";
        const method = isEdit ? "PUT" : "POST";

        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            "số điện thoại": formData.phone,
          }),
        });

        if (response.status === 429) {
          const retryAfter = response.headers.get("Retry-After") || "5";
          await new Promise((resolve) =>
            setTimeout(resolve, parseInt(retryAfter) * 1000)
          );
          retries++;
          continue;
        }

        if (!response.ok)
          throw new Error(
            `Không thể ${isEdit ? "cập nhật" : "thêm"} người dùng.`
          );
        alert(`${isEdit ? "Cập nhật" : "Thêm"} người dùng thành công!`);
        router.push("/admin/users");
        return;
      } catch (err) {
            throw(error)
        return;
      }
    }
    setError(`Max retries reached due to 429 errors`);
  };

  return { formData, error, handleChange, handleSubmit };
}
