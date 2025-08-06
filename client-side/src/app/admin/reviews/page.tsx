import AdminReviewContent from "@/admin/components/Admin_Review/AdminReviewContent";
import { Suspense } from "react";

export default function AdminReviewContentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminReviewContent />
    </Suspense>
  );
}