import AdminCategoryContent from "@/admin/components/Admin_Category/AdminCategoryContent";
import { Suspense } from "react";

export default function AdminCategoryContentPage() {
  return (
    <Suspense fallback={null}>
      <AdminCategoryContent />
    </Suspense>
  );
}