"use client";

import { useEffect, useState } from "react";
import { Coupon } from "@/types/coupon";
import { fetchCouponById } from "@/services/couponApi";
import Link from "next/link";

interface Props {
  initialCoupons: Coupon[];
}

export default function CouponList({ initialCoupons }: Props) {
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const handleSelectCoupon = async (id: string) => {
    setDetailLoading(true);
    try {
      const data = await fetchCouponById(id);
      setSelectedCoupon(data);
    } catch (err) {
      console.error("Không thể tải chi tiết mã giảm giá:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="flex gap-6 pb-16">
      {/* DANH SÁCH MÃ */}
      <div className="w-[70%]">
        {coupons.length === 0 ? (
          <p>Không có mã giảm giá nào khả dụng.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {coupons.map((coupon) => (
              <div
                key={coupon._id}
                className="flex flex-col gap-4 rounded-lg p-4 shadow-custom-order transition-all border"
              >
                <div>
                  <h2 className="text-xl font-semibold">{coupon.code}</h2>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {coupon.description || "Không có mô tả"}
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <p className="text-black font-bold">
                    {coupon.discountType === "percent"
                      ? `Giảm ${coupon.discountValue}%`
                      : `Giảm ${coupon.discountValue.toLocaleString("vi-VN")}đ`}
                  </p>
                  <p className="text-sm text-black">
                    Còn: {coupon.usageLimit - coupon.usedCount}/
                    {coupon.usageLimit}
                  </p>
                  <p className="text-sm text-black">
                    HSD: {new Date(coupon.endDate).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleSelectCoupon(coupon._id)}
                    className="border border-black rounded text-sm py-2 hover:bg-black hover:text-white transition p-3"
                  >
                    Xem chi tiết
                  </button>
                  <Link
                    href={`/products?coupon=${coupon.code}`}
                    className="text-center border border-black border-solid py-2 text-sm rounded hover:bg-black hover:text-white transition p-3"
                  >
                    Xem sản phẩm áp dụng
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CHI TIẾT MÃ */}
      <div className="w-[30%] rounded-lg p-4 shadow-custom-order h-fit sticky top-4">
        {detailLoading ? (
          <p className="text-gray-500">Đang tải chi tiết...</p>
        ) : selectedCoupon ? (
          <div className="p-4 rounded-lg bg-white flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-bold">{selectedCoupon.code}</h2>
              <p className="text-gray-600 text-sm line-clamp-2">
                {selectedCoupon.description || "Không có mô tả"}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 text-sm text-gray-800">
              <p>
                <span>Loại giảm:</span>{" "}
                {selectedCoupon.discountType === "percent"
                  ? `Giảm ${selectedCoupon.discountValue}%`
                  : `Giảm ${selectedCoupon.discountValue.toLocaleString(
                      "vi-VN"
                    )}đ`}
              </p>
              <p>
                <span>Đơn tối thiểu:</span>{" "}
                {selectedCoupon.minOrderAmount
                  ? `${selectedCoupon.minOrderAmount.toLocaleString("vi-VN")}đ`
                  : "Không yêu cầu"}
              </p>
              <p className="">
                <span>Giảm tối đa:</span>{" "}
                {selectedCoupon.maxDiscountAmount
                  ? `${selectedCoupon.maxDiscountAmount.toLocaleString(
                      "vi-VN"
                    )}đ`
                  : "Không giới hạn"}
              </p>
              <p className="">
                <span>Còn:</span>{" "}
                {selectedCoupon.usageLimit
                  ? `${selectedCoupon.usageLimit - selectedCoupon.usedCount}/${
                      selectedCoupon.usageLimit
                    }`
                  : "Không giới hạn"}
              </p>
              <p>
                <span>Hiệu lực:</span>{" "}
                {new Date(selectedCoupon.startDate).toLocaleDateString("vi-VN")}{" "}
                - {new Date(selectedCoupon.endDate).toLocaleDateString("vi-VN")}
              </p>
              <p>
                <span>Trạng thái:</span>{" "}
                {selectedCoupon.is_active ? "Đang hoạt động" : "Đã tắt"}
              </p>
            </div>

            <Link
              href={`/products?coupon=${selectedCoupon.code}`}
              className="inline-block text-center w-full border border-black border-solid py-2 text-sm rounded hover:bg-black hover:text-white transition"
            >
              Xem sản phẩm áp dụng
            </Link>
          </div>
        ) : (
          <p className="text-gray-500 text-sm italic">
            Chọn một mã để xem chi tiết.
          </p>
        )}
      </div>
    </div>
  );
}
