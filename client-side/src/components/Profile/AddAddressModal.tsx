"use client";
import React from "react";
import Image from "next/image";

interface Props {
  onClose: () => void;
}

export default function AddAddressModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4">
      <div className="bg-white w-[536px] rounded-lg shadow-lg p-[48px] relative">
        {/* Header: Tiêu đề + nút đóng */}
        <div className="flex justify-between items-center mb-[24px]">
          <h2 className="text-[24px] font-bold text-black leading-[36px]">
            Thêm địa chỉ
          </h2>
          <button
            onClick={onClose}
            className="w-[36px] h-[36px] rounded-full bg-[#F5F5F5] flex items-center justify-center"
          >
            <Image src="/profile/Group.png" alt="Đóng" width={20} height={20} />
          </button>
        </div>

        {/* Form */}
        <form className="flex flex-col items-center">
          {/* 6 Input/select giống nhau */}
          {["Họ và tên", "Email", "Số điện thoại", "Địa chỉ"].map(
            (placeholder, index) => (
              <input
                key={index}
                type="text"
                placeholder={placeholder}
                className="w-[440px] h-[47px] px-3 border border-gray-300 rounded-[4px] mb-[16px] text-sm"
              />
            )
          )}

          {/* Selects có icon */}
          {["Chọn tỉnh / thành", "Chọn quận / huyện", "Chọn phường / xã"].map(
            (placeholder, index) => (
              <div key={index} className="relative w-[440px] mb-[16px]">
                <select
                  defaultValue=""
                  className="w-full h-[47px] px-3 pr-10 border border-gray-300 rounded-[4px] text-sm text-gray-600 appearance-none"
                >
                  <option disabled value="">
                    {placeholder}
                  </option>
                </select>
                <Image
                  src="/profile/Vector (Stroke).svg"
                  alt="Dropdown icon"
                  width={16}
                  height={16}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
                />
              </div>
            )
          )}

          {/* Nút lưu */}
          <button
            type="submit"
            className="w-[440px] h-[40px] mt-[36px] bg-black text-[#F5F5F5] rounded-[8px] text-sm hover:bg-opacity-90"
          >
            Lưu thay đổi
          </button>
        </form>
      </div>
    </div>
  );
}
