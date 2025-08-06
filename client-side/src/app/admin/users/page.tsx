import AdminUserContent from "@/admin/components/Admin_User/AdminUserContent";
import { Suspense } from "react";

export default function AdminUserContentPage() {
  return (
    <Suspense fallback={null}>
      <AdminUserContent />
    </Suspense>
  );
}
