// app/(client)/coupons/page.tsx
import { Suspense } from "react";
import Container from "@/components/Core/Container";
import CouponList from "@/components/Coupons/CouponList";

export default function CouponsPage() {
  return (
    <Container>
      <Suspense fallback={<div>Loading checkout...</div>}>
        <h1 className="py-16 text-2xl font-bold pb-6">Danh sách mã giảm giá</h1>
        <CouponList />
      </Suspense>
    </Container>
  );
}
