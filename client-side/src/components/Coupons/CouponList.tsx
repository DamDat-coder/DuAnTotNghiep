"use client";

import { useEffect, useState } from "react";
import { Coupon } from "@/types/coupon";
import { fetchAllCoupons, fetchCouponById } from "@/services/couponApi";
import Link from "next/link";
import toast from "react-hot-toast";
import { Copy, X } from "lucide-react";
import Container from "../Core/Container";
import { Tooltip as ReactTooltip } from "react-tooltip";

export default function CouponList() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await fetchAllCoupons(true);
        setCoupons(data || []);
      } catch (err) {
        console.error("Không thể tải danh sách mã giảm giá:", err);
        toast.error("Lỗi khi tải danh sách mã giảm giá!");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSelectCoupon = async (id: string) => {
    setDetailLoading(true);
    try {
      const data = await fetchCouponById(id);
      setSelectedCoupon(data);
    } catch (err) {
      console.error("Không thể tải chi tiết mã giảm giá:", err);
      toast.error("Lỗi khi tải chi tiết mã giảm giá!");
    } finally {
      setDetailLoading(false);
    }
  };

  // Component cho mobile và tablet (2 cột + popup)
  const MobileTabletLayout = () => {
    const closePopup = () => {
      setSelectedCoupon(null);
    };
    useEffect(() => {
      if (typeof window === "undefined") return;

      const isMobileOrTablet = window.innerWidth < 1024;
      if (selectedCoupon && isMobileOrTablet) {
        document.body.classList.add("overflow-hidden");
      } else {
        document.body.classList.remove("overflow-hidden");
      }

      return () => {
        document.body.classList.remove("overflow-hidden");
      };
    }, [selectedCoupon]);

    return (
      <div className="pb-16">
        <div className="w-full">
          {coupons.length === 0 ? (
            <p>Không có mã giảm giá nào khả dụng.</p>
          ) : (
            <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4">
              {coupons.map((coupon) => (
                <div
                  key={coupon._id}
                  className="flex flex-col gap-4 rounded-lg p-4 shadow-custom-order transition-all border border-gray-200"
                >
                  <div className="h-[4.5rem]">
                    <h2 className="text-xl font-semibold">{coupon.code}</h2>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {coupon.description || "Không có mô tả"}
                    </p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <p className="text-black font-bold">
                      {coupon.discountType === "percent"
                        ? `Giảm ${coupon.discountValue}%`
                        : `Giảm ${coupon.discountValue.toLocaleString(
                            "vi-VN"
                          )}đ`}
                    </p>
                    <p className="text-sm text-black">
                      Còn:{" "}
                      {coupon.usageLimit !== null &&
                      coupon.usageLimit !== undefined
                        ? `${coupon.usageLimit - coupon.usedCount}/${
                            coupon.usageLimit
                          }`
                        : "Không giới hạn"}
                    </p>
                    <p className="text-sm text-black">
                      HSD:{" "}
                      {coupon.endDate
                        ? new Date(coupon.endDate).toLocaleDateString("vi-VN")
                        : "Không giới hạn thời gian"}
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
                      data-tooltip-id={`tooltip-${coupon._id}`}
                      data-tooltip-content={
                        coupon.applicableProducts?.length === 0 &&
                        coupon.applicableCategories?.length === 0
                          ? "Mã giảm giá áp dụng cho toàn bộ sản phẩm"
                          : undefined
                      }
                    >
                      Xem sản phẩm áp dụng
                    </Link>
                    <ReactTooltip
                      id={`tooltip-${coupon._id}`}
                      place="top"
                      style={{
                        backgroundColor: "#1F2937",
                        color: "#FFFFFF",
                        fontSize: "12px",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        maxWidth: "200px",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Popup chi tiết mã */}
        {selectedCoupon && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={closePopup}
                className="absolute top-3 right-3 text-gray-500 hover:text-black"
              >
                <X size={24} />
              </button>
              {detailLoading ? (
                <p className="text-gray-500 text-center">
                  Đang tải chi tiết...
                </p>
              ) : (
                <div className="flex flex-col gap-6">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {selectedCoupon.code}
                    </h2>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedCoupon.code);
                        toast.success("Đã sao chép mã!");
                      }}
                      className="absolute top-3 right-12 group text-xs px-3 py-2 border rounded hover:bg-black hover:text-white flex gap-2 transition"
                    >
                      <Copy
                        size={16}
                        className="text-gray-500 group-hover:text-white transition"
                      />
                      Sao chép
                    </button>
                    <p className="text-gray-600 text-sm mt-2">
                      {selectedCoupon.description || "Không có mô tả"}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-3 text-sm text-gray-800">
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
                      <span className="font-medium">Còn:</span>{" "}
                      {selectedCoupon.usageLimit
                        ? `${
                            selectedCoupon.usageLimit - selectedCoupon.usedCount
                          }/${selectedCoupon.usageLimit}`
                        : "Không giới hạn"}
                    </p>
                    <p>
                      <span className="font-medium">Hiệu lực:</span>{" "}
                      {selectedCoupon.startDate && selectedCoupon.endDate
                        ? `${new Date(
                            selectedCoupon.startDate
                          ).toLocaleDateString("vi-VN")} - ${new Date(
                            selectedCoupon.endDate
                          ).toLocaleDateString("vi-VN")}`
                        : selectedCoupon.startDate
                        ? `Từ ngày ${new Date(
                            selectedCoupon.startDate
                          ).toLocaleDateString("vi-VN")}, vô thời hạn`
                        : selectedCoupon.endDate
                        ? `Hiệu lực đến ngày ${new Date(
                            selectedCoupon.endDate
                          ).toLocaleDateString("vi-VN")}`
                        : "Không giới hạn thời gian"}
                    </p>
                    <p>
                      <span className="font-medium">Trạng thái:</span>{" "}
                      {selectedCoupon.is_active ? "Đang hoạt động" : "Đã tắt"}
                    </p>
                  </div>
                  <Link
                    href={`/products?coupon=${selectedCoupon.code}`}
                    className="inline-block text-center w-full border border-black border-solid py-2 text-sm rounded hover:bg-black hover:text-white transition"
                    onClick={closePopup}
                    data-tooltip-id={`tooltip-detail-${selectedCoupon._id}`}
                    data-tooltip-content={
                      selectedCoupon.applicableProducts?.length === 0 &&
                      selectedCoupon.applicableCategories?.length === 0
                        ? "Mã giảm giá áp dụng cho toàn bộ sản phẩm"
                        : undefined
                    }
                  >
                    Xem sản phẩm áp dụng
                  </Link>
                  <ReactTooltip
                    id={`tooltip-detail-${selectedCoupon._id}`}
                    place="top"
                    style={{
                      backgroundColor: "#1F2937",
                      color: "#FFFFFF",
                      fontSize: "12px",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      maxWidth: "200px",
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Component cho laptop và desktop (2 cột + 1 cột phụ)
  const LaptopDesktopLayout = () => (
    <div className="flex gap-6 pb-16">
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
                    Còn:{" "}
                    {coupon.usageLimit !== null &&
                    coupon.usageLimit !== undefined
                      ? `${coupon.usageLimit - coupon.usedCount}/${
                          coupon.usageLimit
                        }`
                      : "Không giới hạn"}
                  </p>
                  <p className="text-sm text-black">
                    HSD:{" "}
                    {coupon.endDate
                      ? new Date(coupon.endDate).toLocaleDateString("vi-VN")
                      : "Không giới hạn thời gian"}
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
                    data-tooltip-id={`tooltip-${coupon._id}`}
                    data-tooltip-content={
                      coupon.applicableProducts?.length === 0 &&
                      coupon.applicableCategories?.length === 0
                        ? "Mã giảm giá áp dụng cho toàn bộ sản phẩm"
                        : undefined
                    }
                  >
                    Xem sản phẩm áp dụng
                  </Link>
                  <ReactTooltip
                    id={`tooltip-${coupon._id}`}
                    place="top"
                    style={{
                      backgroundColor: "#1F2937",
                      color: "#FFFFFF",
                      fontSize: "12px",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      maxWidth: "200px",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="w-[30%] rounded-lg shadow-custom-order h-fit sticky top-24">
        {detailLoading ? (
          <p className="p-4 text-gray-500">Đang tải chi tiết...</p>
        ) : selectedCoupon ? (
          <div className="p-8 rounded-lg bg-white flex flex-col gap-6 relative">
            <div>
              <h2 className="text-xl font-semibold">{selectedCoupon.code}</h2>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedCoupon.code);
                  toast.success("Đã sao chép mã!");
                }}
                className="absolute top-3 right-3 group text-xs px-3 py-2 border rounded hover:bg-black hover:text-white flex gap-2 transition"
              >
                <Copy
                  size={16}
                  className="text-gray-500 group-hover:text-white transition"
                />
                Sao chép
              </button>
              <p className="text-gray-600 text-sm line-clamp-2">
                {selectedCoupon.description || "Không có mô tả"}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 text-sm text-gray-800">
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
                  ? `${selectedCoupon.minOrderAmount.toLocaleString("vi-VN")}đ`
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
                <span className="font-medium">Còn:</span>{" "}
                {selectedCoupon.usageLimit
                  ? `${selectedCoupon.usageLimit - selectedCoupon.usedCount}/${
                      selectedCoupon.usageLimit
                    }`
                  : "Không giới hạn"}
              </p>
              <p>
                <span className="font-medium">Hiệu lực:</span>{" "}
                {selectedCoupon.startDate && selectedCoupon.endDate
                  ? `${new Date(selectedCoupon.startDate).toLocaleDateString(
                      "vi-VN"
                    )} - ${new Date(selectedCoupon.endDate).toLocaleDateString(
                      "vi-VN"
                    )}`
                  : selectedCoupon.startDate
                  ? `Từ ngày ${new Date(
                      selectedCoupon.startDate
                    ).toLocaleDateString("vi-VN")}, vô thời hạn`
                  : selectedCoupon.endDate
                  ? `Hiệu lực đến ngày ${new Date(
                      selectedCoupon.endDate
                    ).toLocaleDateString("vi-VN")}`
                  : "Không giới hạn thời gian"}
              </p>
              <p>
                <span className="font-medium">Trạng thái:</span>{" "}
                {selectedCoupon.is_active ? "Đang hoạt động" : "Đã tắt"}
              </p>
            </div>
            <Link
              href={`/products?coupon=${selectedCoupon.code}`}
              className="inline-block text-center w-full border border-black border-solid py-2 text-sm rounded hover:bg-black hover:text-white transition"
              data-tooltip-id={`tooltip-detail-${selectedCoupon._id}`}
              data-tooltip-content={
                selectedCoupon.applicableProducts?.length === 0 &&
                selectedCoupon.applicableCategories?.length === 0
                  ? "Mã giảm giá áp dụng cho toàn bộ sản phẩm"
                  : undefined
              }
            >
              Xem sản phẩm áp dụng
            </Link>
            <ReactTooltip
              id={`tooltip-detail-${selectedCoupon._id}`}
              place="top"
              style={{
                backgroundColor: "#1F2937",
                color: "#FFFFFF",
                fontSize: "12px",
                padding: "4px 8px",
                borderRadius: "4px",
                maxWidth: "200px",
              }}
            />
          </div>
        ) : (
          <p className="p-4 text-gray-500 text-sm italic">
            Chọn một mã để xem chi tiết.
          </p>
        )}
      </div>
    </div>
  );

  return (
    <Container>
      <h1 className="py-16 text-lg laptop:text-2xl desktop:text-2xl font-bold pb-6">
        Danh sách mã giảm giá
      </h1>
      <div className="laptop:hidden desktop:hidden">
        <MobileTabletLayout />
      </div>
      <div className="hidden laptop:block desktop:block">
        <LaptopDesktopLayout />
      </div>
    </Container>
  );
}