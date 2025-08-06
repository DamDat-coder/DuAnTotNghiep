import AdminUserContent from "@/admin/components/Admin_User/AdminUserContent";
import { Suspense } from "react";

export default function AdminUserContentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminUserContent />
    </Suspense>
  );
}
