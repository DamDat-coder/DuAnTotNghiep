// app/(client)/coupons/page.tsx
import { Suspense } from "react";
import CouponList from "@/components/Coupons/CouponList";

export default function CouponsPage() {
  return (
    <Suspense fallback={null}>
      <CouponList />
    </Suspense>
  );
}
