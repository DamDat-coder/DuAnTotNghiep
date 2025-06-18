"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useAddressData } from "@/hooks/useAddressData";

interface Props {
  onClose: () => void;
}

export default function AddAddressModal({ onClose }: Props) {
  const {
    provinces,
    districts,
    wards,
    provinceCode,
    districtCode,
    setProvinceCode,
    setDistrictCode,
    setWardCode,
  } = useAddressData();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    street: "",
    wardCode: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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
          <input
            type="text"
            name="name"
            placeholder="Họ và tên"
            value={formData.name}
            onChange={handleChange}
            className="w-[440px] h-[47px] px-3 border border-gray-300 rounded-[4px] mb-[16px] text-sm"
          />
          <input
            type="text"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-[440px] h-[47px] px-3 border border-gray-300 rounded-[4px] mb-[16px] text-sm"
          />
          <input
            type="text"
            name="phone"
            placeholder="Số điện thoại"
            value={formData.phone}
            onChange={handleChange}
            className="w-[440px] h-[47px] px-3 border border-gray-300 rounded-[4px] mb-[16px] text-sm"
          />

          {/* Chọn tỉnh / thành */}
          <div className="relative w-[440px] mb-[16px]">
            <select
              value={provinceCode || ""}
              onChange={(e) => setProvinceCode(Number(e.target.value))}
              className="w-full h-[47px] px-3 pr-10 border border-gray-300 rounded-[4px] text-sm text-gray-600 appearance-none"
            >
              <option disabled value="">
                Chọn tỉnh / thành
              </option>
              {provinces.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.name}
                </option>
              ))}
            </select>
            <Image
              src="/profile/Vector (Stroke).svg"
              alt="Dropdown icon"
              width={16}
              height={16}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
            />
          </div>

          {/* Quận / huyện */}
          <div className="relative w-[440px] mb-[16px]">
            <select
              value={districtCode || ""}
              onChange={(e) => setDistrictCode(Number(e.target.value))}
              className="w-full h-[47px] px-3 pr-10 border border-gray-300 rounded-[4px] text-sm text-gray-600 appearance-none"
            >
              <option disabled value="">
                Chọn quận / huyện
              </option>
              {districts.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.name}
                </option>
              ))}
            </select>
            <Image
              src="/profile/Vector (Stroke).svg"
              alt="Dropdown icon"
              width={16}
              height={16}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
            />
          </div>

          {/* Phường / xã */}
          <div className="relative w-[440px] mb-[16px]">
            <select
              name="wardCode"
              value={formData.wardCode}
              onChange={(e) => {
                handleChange(e);
                setWardCode(Number(e.target.value));
              }}
              className="w-full h-[47px] px-3 pr-10 border border-gray-300 rounded-[4px] text-sm text-gray-600 appearance-none"
            >
              <option disabled value="">
                Chọn phường / xã
              </option>
              {wards.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.name}
                </option>
              ))}
            </select>
            <Image
              src="/profile/Vector (Stroke).svg"
              alt="Dropdown icon"
              width={16}
              height={16}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
            />
          </div>

          <input
            type="text"
            name="street"
            placeholder="Địa chỉ"
            value={formData.street}
            onChange={handleChange}
            className="w-[440px] h-[47px] px-3 border border-gray-300 rounded-[4px] text-sm"
          />

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
