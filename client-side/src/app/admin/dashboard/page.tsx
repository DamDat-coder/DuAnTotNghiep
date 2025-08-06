import AdminDashboardContent from "@/admin/components/Dashboard/AdminDashboardContent";
import { Suspense } from "react";

export default function AdminDashboardContentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminDashboardContent />
    </Suspense>
  );
}