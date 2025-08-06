import AdminProductsContent from "@/admin/components/Admin_Products/AdminProductsContent";
import { Suspense } from "react";

export default function AdminProductsContentPage() {
  return (
    <Suspense fallback={null}>
      <AdminProductsContent />
    </Suspense>
  );
}