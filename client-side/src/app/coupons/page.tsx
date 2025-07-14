import { fetchAllCoupons } from "@/services/couponApi";
import Container from "@/components/Core/Container";
import CouponList from "@/components/Coupons/CouponList";
import { Coupon } from "@/types/coupon";

export default async function CouponsPage() {
  let coupons: Coupon[] = [];

  try {
    const { data } = await fetchAllCoupons(true);
    coupons = data || [];
  } catch (err) {
    console.error("Lỗi SSR khi fetch danh sách mã giảm giá:", err);
  }

  return (
    <Container>
      <h1 className="py-16 text-2xl font-bold pb-6">Danh sách mã giảm giá</h1>
      <CouponList initialCoupons={coupons} />
    </Container>
  );
}
