// app/coupons/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Coupon } from "@/types/coupon";
import { fetchCouponById } from "@/services/couponApi";
import Container from "@/components/Core/Container";

export default function CouponDetailPage() {
  const { id } = useParams();
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || typeof id !== "string") return;

    const loadCoupon = async () => {
      try {
        const data = await fetchCouponById(id);
        setCoupon(data);
      } catch (err) {
        console.error("Không thể tải chi tiết mã giảm giá:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCoupon();
  }, [id]);

  if (loading) return <div className="p-6">Đang tải...</div>;
  if (!coupon)
    return <div className="p-6 text-red-500">Không tìm thấy mã giảm giá.</div>;

  return (
    <Container>
      <div className="py-16">
        <h1 className="text-2xl font-bold pb-2">{coupon.code}</h1>
        <p className="text-gray-700 pb-4">
          {coupon.description || "Không có mô tả"}
        </p>

        {/* Trạng thái & hiệu lực */}
        <div className="pb-6 p-4 border rounded bg-gray-50">
          <p className="text-sm text-gray-500 pb-2 font-semibold">
            Hiệu lực mã
          </p>
          <div className="flex flex-wrap gap-6 text-sm text-gray-800">
            <p>
              <span className="font-medium">Trạng thái:</span>{" "}
              {coupon.is_active ? "Đang hoạt động" : "Đã tắt"}
            </p>
            <p>
              <span className="font-medium">Bắt đầu:</span>{" "}
              {new Date(coupon.startDate).toLocaleDateString("vi-VN")}
            </p>
            <p>
              <span className="font-medium">Hết hạn:</span>{" "}
              {new Date(coupon.endDate).toLocaleDateString("vi-VN")}
            </p>
          </div>
        </div>

        {/* Điều kiện & ưu đãi */}
        <div className="pb-6 p-4 border rounded bg-white relative">
          <p className="text-sm text-gray-500 pb-2 font-semibold">
            Điều kiện & Ưu đãi
          </p>

          {/* Nút điều hướng sang trang sản phẩm áp dụng mã */}
          <a
            href={`/products?coupon=${coupon._id}`}
            className="absolute right-4 top-4 text-sm text-black hover:underline font-medium"
          >
            Xem sản phẩm áp dụng
          </a>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-800 mt-2">
            <p>
              <span className="font-medium">Loại giảm:</span>{" "}
              {coupon.discountType === "percent"
                ? `Giảm ${coupon.discountValue}%`
                : `Giảm ${coupon.discountValue.toLocaleString("vi-VN")}đ`}
            </p>
            <p>
              <span className="font-medium">Đơn tối thiểu:</span>{" "}
              {coupon.minOrderAmount
                ? `${coupon.minOrderAmount.toLocaleString("vi-VN")}đ`
                : "Không yêu cầu"}
            </p>
            <p>
              <span className="font-medium">Giảm tối đa:</span>{" "}
              {coupon.maxDiscountAmount
                ? `${coupon.maxDiscountAmount.toLocaleString("vi-VN")}đ`
                : "Không giới hạn"}
            </p>
            <p>
              <span className="font-medium">Lượt sử dụng:</span>{" "}
              {coupon.usageLimit
                ? `${coupon.usedCount}/${coupon.usageLimit} lượt`
                : "Không giới hạn"}
            </p>
          </div>
        </div>
      </div>

      {/* Gợi ý: Nếu có applicableCategories hoặc applicableProducts thì hiển thị ở đây */}
    </Container>
  );
}
