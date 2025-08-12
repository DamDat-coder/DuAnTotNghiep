"use client";

import { useState } from "react";
import { Coupon } from "@/types/coupon";
import { motion } from "framer-motion";
import { X } from "lucide-react";

interface DiscountCodeProps {
  discountCode: string;
  setDiscountCode: (code: string) => void;
  handleApplyDiscount: () => void;
  availableCoupons?: Coupon[];
}

export default function DiscountCode({
  discountCode,
  setDiscountCode,
  handleApplyDiscount,
  availableCoupons = [],
}: DiscountCodeProps) {
  const [open, setOpen] = useState(false);
  const [selectedCouponForDetails, setSelectedCouponForDetails] = useState<
    string | null
  >(null);

  const handleSelect = (code: string) => {
    setDiscountCode(code);
    setOpen(false);
    setSelectedCouponForDetails(null);
  };

  const handleToggleDetails = (code: string) => {
    setSelectedCouponForDetails(
      selectedCouponForDetails === code ? null : code
    );
  };

  return (
    <div className="mt-8 relative">
      <label className="text-[1rem] font-medium">Mã giảm giá</label>

      {/* Custom dropdown */}
      {availableCoupons.length > 0 && (
        <div className="mt-2 relative">
          <div
            className="w-full border border-solid border-gray-300 rounded-md py-[0.875rem] px-3 cursor-pointer flex items-center justify-between"
            onClick={() => setOpen(!open)}
          >
            <span>
              {discountCode
                ? availableCoupons.find((c) => c.code === discountCode)?.code
                : "Chọn mã giảm giá"}
            </span>
            <div className="flex items-center gap-2">
              {discountCode && (
                <X
                  size={16}
                  className="text-gray-500 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDiscountCode("");
                    setSelectedCouponForDetails(null);
                  }}
                />
              )}
              <motion.div
                animate={{ rotate: open ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <svg
                  className="w-4 h-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </motion.div>
            </div>
          </div>

          {open && (
            <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg">
              {availableCoupons.map((coupon) => (
                <li
                  key={coupon.code}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer relative"
                >
                  <div
                    onClick={() => handleSelect(coupon.code)}
                    className="font-medium"
                  >
                    {coupon.code}
                  </div>
                  {coupon.description && (
                    <div className="text-sm text-gray-500">
                      {coupon.description}
                    </div>
                  )}
                  <button
                    onClick={() => handleToggleDetails(coupon.code)}
                    className="text-xs border-solid border-black border rounded hover:bg-black hover:text-white transition-all py-2 px-3 mt-2"
                  >
                    {selectedCouponForDetails === coupon.code
                      ? "Ẩn chi tiết"
                      : "Xem chi tiết"}
                  </button>
                  {selectedCouponForDetails === coupon.code && (
                    <div className="absolute z-20 w-full bg-white border border-gray-300 rounded-md p-3 mt-1 shadow-lg">
                      <div className="flex flex-col gap-3">
                        <p className="text-sm font-bold">{coupon.code}</p>
                        <p className="text-sm text-gray-600">
                          Mô tả: {coupon.description || "Không có mô tả"}
                        </p>
                        <p className="text-sm text-gray-600">
                          Lượt dùng còn lại:{" "}
                          {coupon.usageLimit !== null &&
                          coupon.usageLimit !== undefined
                            ? `${coupon.usageLimit - coupon.usedCount}/${
                                coupon.usageLimit
                              }`
                            : "Không giới hạn"}
                        </p>
                        <p className="text-sm text-gray-600">
                          Giá trị:{" "}
                          {coupon.discountType === "percent"
                            ? `-${coupon.discountValue}%`
                            : `-${coupon.discountValue.toLocaleString("vi-VN")}đ`}
                        </p>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Ô nhập + nút áp dụng */}
      <div className="flex mt-2">
        <input
          type="text"
          value={discountCode}
          onChange={(e) => setDiscountCode(e.target.value)}
          placeholder="Nhập mã giảm giá"
          className="w-full py-[0.875rem] pl-3 border border-gray-300 rounded-l-md"
        />
        <button
          onClick={handleApplyDiscount}
          className="w-6/12 bg-black text-white font-medium rounded-r-md hover:bg-gray-800 text-[0.875rem]"
        >
          Áp Dụng
        </button>
      </div>
    </div>
  );
}