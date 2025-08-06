import AdminOrderContent from "@/admin/components/Admin_Order/AdminOrderContent";
import { Suspense } from "react";

export default function AdminOrderContentPage() {
  return (
    <Suspense fallback={null}>
      <AdminOrderContent />
    </Suspense>
  );
}
