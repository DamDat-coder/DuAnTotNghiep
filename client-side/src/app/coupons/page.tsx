"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Coupon } from "@/types/coupon";
import { fetchAllCoupons, fetchCouponById } from "@/services/couponApi";
import Container from "@/components/Core/Container";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    const loadCoupons = async () => {
      try {
        const { data } = await fetchAllCoupons(true);
        setCoupons(data);
      } catch (err) {
        console.error("Lỗi khi lấy danh sách mã giảm giá:", err);
      } finally {
        setLoading(false);
      }
    };
    loadCoupons();
  }, []);

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
    <Container>
      <h1 className="py-16 text-2xl font-bold pb-6">Danh sách mã giảm giá</h1>
      <div className="flex gap-6">
        {/* DANH SÁCH MÃ */}
        <div className="w-[60%]">
          {loading ? (
            <p>Đang tải...</p>
          ) : coupons.length === 0 ? (
            <p>Không có mã giảm giá nào khả dụng.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {coupons.map((coupon) => (
                <div
                  key={coupon._id}
                  className="flex flex-col gap-4 rounded-lg p-4 shadow-custom-order transition-all border"
                >
                  <h2 className="text-xl font-semibold">{coupon.code}</h2>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {coupon.description || "Không có mô tả"}
                  </p>
                  <div className="flex flex-col gap-3">
                    <p className="text-green-600 font-medium">
                      {coupon.discountType === "percent"
                        ? `Giảm ${coupon.discountValue}%`
                        : `Giảm ${coupon.discountValue.toLocaleString(
                            "vi-VN"
                          )}đ`}
                    </p>
                    <p className="text-sm text-gray-400">
                      HSD:{" "}
                      {new Date(coupon.endDate).toLocaleDateString("vi-VN")}
                    </p>
                    <p className="text-sm text-red-500">
                      Còn {coupon.usageLimit - coupon.usedCount} lượt sử dụng
                    </p>
                  </div>
                  <button
                    onClick={() => handleSelectCoupon(coupon._id)}
                    className="w-[40%] border border-black rounded text-sm py-2 hover:bg-gray-100"
                  >
                    Xem chi tiết
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CHI TIẾT MÃ */}
        <div className="w-[40%] rounded-lg p-4 shadow-custom-order h-fit sticky top-4">
          {detailLoading ? (
            <p className="text-gray-500">Đang tải chi tiết...</p>
          ) : selectedCoupon ? (
            <div className="p-4 rounded-lg bg-white">
              <h2 className="text-xl font-bold mb-2">{selectedCoupon.code}</h2>
              <p className="text-gray-700 mb-3">
                {selectedCoupon.description || "Không có mô tả"}
              </p>

              <div className="grid grid-cols-1 gap-2 text-sm text-gray-800">
                <p>
                  <span className="font-medium">Loại giảm:</span>{" "}
                  {selectedCoupon.discountType === "percent"
                    ? `Giảm ${selectedCoupon.discountValue}%`
                    : `Giảm ${selectedCoupon.discountValue.toLocaleString(
                        "vi-VN"
                      )}đ`}
                </p>
                <p>
                  <span className="font-medium">Đơn tối thiểu:</span>{" "}
                  {selectedCoupon.minOrderAmount
                    ? `${selectedCoupon.minOrderAmount.toLocaleString(
                        "vi-VN"
                      )}đ`
                    : "Không yêu cầu"}
                </p>
                <p>
                  <span className="font-medium">Giảm tối đa:</span>{" "}
                  {selectedCoupon.maxDiscountAmount
                    ? `${selectedCoupon.maxDiscountAmount.toLocaleString(
                        "vi-VN"
                      )}đ`
                    : "Không giới hạn"}
                </p>
                <p>
                  <span className="font-medium">Lượt dùng:</span>{" "}
                  {selectedCoupon.usageLimit
                    ? `${selectedCoupon.usedCount}/${selectedCoupon.usageLimit}`
                    : "Không giới hạn"}
                </p>
                <p>
                  <span className="font-medium">Hiệu lực:</span>{" "}
                  {new Date(selectedCoupon.startDate).toLocaleDateString(
                    "vi-VN"
                  )}{" "}
                  -{" "}
                  {new Date(selectedCoupon.endDate).toLocaleDateString("vi-VN")}
                </p>
                <p>
                  <span className="font-medium">Trạng thái:</span>{" "}
                  {selectedCoupon.is_active ? "Đang hoạt động" : "Đã tắt"}
                </p>
              </div>

              <Link
                href={`/products?coupon=${selectedCoupon._id}`}
                className="mt-4 inline-block text-center w-full border border-black border-solid py-2 text-sm rounded hover:bg-black hover:text-white transition"
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
    </Container>
  );
}
