"use client";

import { useState, Fragment } from "react";
import { Coupon } from "@/types/coupon";
import { motion } from "framer-motion";
import { X, ChevronsUpDown } from "lucide-react";
import { Combobox, Transition } from "@headlessui/react";

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
  const [openDetails, setOpenDetails] = useState(false);
  const [query, setQuery] = useState("");

  const filteredCoupons =
    query === ""
      ? availableCoupons
      : availableCoupons.filter((coupon) =>
          coupon.code.toLowerCase().includes(query.toLowerCase())
        );

  const selectedCoupon = availableCoupons.find(
    (coupon) => coupon.code === discountCode
  );

  const handleClear = () => {
    setDiscountCode("");
    setOpenDetails(false);
    setQuery("");
  };

  const handleToggleDetails = () => {
    setOpenDetails((prev) => !prev);
  };

  return (
    <div className="mt-8 relative">
      <label className="text-[1rem] font-medium">Mã giảm giá</label>

      <div className="mt-2 flex">
        <Combobox
          value={discountCode}
          onChange={(value: string) => {
            setDiscountCode(value);
            setQuery(value);
            setOpenDetails(false);
          }}
        >
          <div className="relative w-full">
            <div className="relative w-full cursor-default overflow-hidden rounded-l-md border border-solid border-gray-300 bg-white text-left">
              <Combobox.Input
                className="w-full py-[0.875rem] px-3 focus:outline-none"
                placeholder="Nhập hoặc chọn mã giảm giá"
                displayValue={(code: string) => code}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setDiscountCode(e.target.value);
                }}
              />
              {discountCode ? (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500"
                >
                  <X size={16} />
                </button>
              ) : (
                <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                  <ChevronsUpDown size={16} />
                </Combobox.Button>
              )}
            </div>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
              afterLeave={() => setQuery("")}
            >
              <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none text-sm">
                {filteredCoupons.length === 0 && query !== "" ? (
                  <div className="cursor-default select-none px-4 py-2 text-gray-500">
                    Không tìm thấy
                  </div>
                ) : (
                  filteredCoupons.map((coupon) => (
                    <Combobox.Option
                      key={coupon.code}
                      value={coupon.code}
                      className={({ active }) =>
                        `relative cursor-pointer select-none py-2 pl-4 pr-4 ${
                          active ? "bg-gray-200" : "text-gray-900"
                        }`
                      }
                    >
                      {coupon.code}
                      <hr />
                      {coupon.description && (
                        <span className="text-gray-500 text-xs">
                          ({coupon.description})
                        </span>
                      )}
                    </Combobox.Option>
                  ))
                )}
              </Combobox.Options>
            </Transition>
          </div>
        </Combobox>

        <button
          onClick={handleApplyDiscount}
          className="w-6/12 bg-black text-white font-medium rounded-r-md hover:bg-gray-800 text-[0.875rem]"
        >
          Áp Dụng
        </button>
      </div>

      {/* Nút xem chi tiết */}
      {discountCode && selectedCoupon && (
        <div className="mt-2">
          <button
            onClick={handleToggleDetails}
            className="text-xs border-solid border-black border rounded hover:bg-black hover:text-white transition-all py-2 px-3"
          >
            {openDetails ? "Ẩn chi tiết" : "Xem chi tiết"}
          </button>
          {openDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-2 w-full bg-white border border-gray-300 rounded-md p-3 shadow-lg"
            >
              <div className="flex flex-col gap-3">
                <p className="text-sm font-bold">{selectedCoupon.code}</p>
                <p className="text-sm text-gray-600">
                  Mô tả: {selectedCoupon.description || "Không có mô tả"}
                </p>
                <p className="text-sm text-gray-600">
                  Lượt dùng còn lại:{" "}
                  {selectedCoupon.usageLimit !== null &&
                  selectedCoupon.usageLimit !== undefined
                    ? `${
                        selectedCoupon.usageLimit - selectedCoupon.usedCount
                      }/${selectedCoupon.usageLimit}`
                    : "Không giới hạn"}
                </p>
                <p className="text-sm text-gray-600">
                  Giá trị:{" "}
                  {selectedCoupon.discountType === "percent"
                    ? `-${selectedCoupon.discountValue}%`
                    : `-${selectedCoupon.discountValue.toLocaleString(
                        "vi-VN"
                      )}đ`}
                </p>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
