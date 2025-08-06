import AdminNewsContent from "@/admin/components/Admin_New/AdminNewsContent";
import { Suspense } from "react";

export default function AdminNewsContentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminNewsContent />
    </Suspense>
  );
}