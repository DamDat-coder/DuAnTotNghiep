// app/coupons/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Coupon } from "@/types/coupon";
import { fetchAllCoupons } from "@/services/couponApi";
import Container from "@/components/Core/Container";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCoupons = async () => {
      try {
        const { data } = await fetchAllCoupons(true); // lấy coupon đang hoạt động
        setCoupons(data);
      } catch (err) {
        console.error("Lỗi khi lấy danh sách mã giảm giá:", err);
      } finally {
        setLoading(false);
      }
    };
    loadCoupons();
  }, []);

  return (
    <Container>
      <div className="py-16">
        <h1 className="text-2xl font-bold pb-6">Danh sách mã giảm giá</h1>

        {loading ? (
          <p>Đang tải...</p>
        ) : coupons.length === 0 ? (
          <p>Không có mã giảm giá nào khả dụng.</p>
        ) : (
          <div className="grid grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-3 desktop:grid-cols-3 md:grid-cols-2 gap-4">
            {coupons.map((coupon) => (
              <div
                key={coupon._id}
                className="flex flex-col gap-4 rounded-lg p-4 shadow-custom-order transition-all"
              >
                <h2 className="text-xl font-semibold">{coupon.code}</h2>
                <p className="text-gray-600 text-sm line-clamp-2">
                  {coupon.description || "Không có mô tả"}
                </p>
                <div className="flex flex-col gap-3">
                  <p className="text-green-600 font-medium">
                    {coupon.discountType === "percent"
                      ? `Giảm ${coupon.discountValue}%`
                      : `Giảm ${coupon.discountValue.toLocaleString("vi-VN")}đ`}
                  </p>
                  <p className="text-sm text-gray-400">
                    HSD: {new Date(coupon.endDate).toLocaleDateString("vi-VN")}
                  </p>
                  <p className="text-sm text-red-500">
                    Còn {coupon.usageLimit - coupon.usedCount} lượt sử dụng
                  </p>
                </div>
                <Link
                  href={`/coupons/${coupon._id}`}
                  className="w-[30%] text-center border border-solid p-3 border-black rounded text-sm hover:bg-gray-100"
                >
                  Xem chi tiết
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
