// src/app/admin/layout.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AdminLayout from "@/admin/layouts/AdminLayout";
import { Toaster } from "react-hot-toast";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();

  if (!user || user.role !== "admin") return null;

  return (
    <div>
      <Toaster />
      {children}
    </div>
  );
}
