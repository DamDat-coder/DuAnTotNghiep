import AdminCouponContent from "@/admin/components/Admin_Coupon/AdminCouponContent";
import { Suspense } from "react";

export default function AdminCouponContentPage() {
  return (
    <Suspense fallback={null}>
      <AdminCouponContent />
    </Suspense>
  );
}