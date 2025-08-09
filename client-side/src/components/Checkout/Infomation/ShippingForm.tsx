"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { CheckoutFormData, CheckoutErrors } from "@/types/checkout";
import { Address } from "@/types/auth";
import { useAddressData } from "@/hooks/useAddressData";

// Tắt SSR cho react-select
const Select = dynamic(() => import("react-select"), { ssr: false });

interface ShippingFormProps {
  formData: CheckoutFormData;
  errors: CheckoutErrors;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, option: any) => void;
  selectedAddress: Address | null;
  setIsAddressPopupOpen: (isOpen: boolean) => void;
  addresses: Address[];
  isLoading: boolean;
}

export default function ShippingForm({
  formData,
  errors,
  handleInputChange,
  handleSelectChange,
  selectedAddress,
  setIsAddressPopupOpen,
  addresses,
  isLoading,
}: ShippingFormProps) {
  const {
    provinces,
    wards,
    provinceCode,
    setProvinceCode,
    setWardCode,
  } = useAddressData();

  // Đồng bộ code khi user đã có selectedAddress
  useEffect(() => {
    if (selectedAddress) {
      const provinceObj = provinces.find(
        (p) => p.name === selectedAddress.province
      );
      const wardObj = wards.find((w) => w.name === selectedAddress.ward);

      if (provinceObj) setProvinceCode(provinceObj.code);
      else console.warn("Province not found:", selectedAddress.province);

      if (wardObj) setWardCode(wardObj.code);
      else console.warn("Ward not found:", selectedAddress.ward);
    }
  }, [selectedAddress, provinces, wards]);

  // Đồng bộ provinceCode khi formData thay đổi
  useEffect(() => {
    if (formData.province && provinces.length > 0) {
      const selectedProvince = provinces.find(
        (p) => p.name === formData.province
      );
      if (selectedProvince && selectedProvince.code !== provinceCode) {
        setProvinceCode(selectedProvince.code);
      }
    }
  }, [formData.province, provinces]);

  // Custom select change để reset logic form và cập nhật code
  const customHandleSelectChange = (name: string, option: any) => {
    const value = option ? option.value : "";

    handleSelectChange(name, option);

    if (name === "province") {
      setProvinceCode(provinces.find((p) => p.name === value)?.code || null);
      setWardCode(null);
      handleSelectChange("ward", null);
    } else if (name === "ward") {
      setWardCode(wards.find((w) => w.name === value)?.code || null);
    }
  };

  return (
    <div className="col-span-full">
      <h2 className="text-[18px] font-medium mb-4 desktop:text-[2rem] desktop:font-bold laptop:text-[2rem] laptop:font-bold">
        THÔNG TIN GIAO HÀNG
      </h2>

      {/* Địa chỉ đã chọn */}
      <div className="mb-4 bg-gray-100 hover:bg-gray-200">
        <div
          onClick={() => setIsAddressPopupOpen(true)}
          className="flex flex-col items-start py-[0.875rem] pl-3 pr-8 gap-2 cursor-pointer"
        >
          <p className="font-bold">Địa chỉ giao hàng</p>
          {isLoading ? (
            <span className="text-gray-500">Đang tải địa chỉ...</span>
          ) : selectedAddress ? (
            <span className="text-slate-500">
              {selectedAddress.street}, {selectedAddress.ward},{" "}
              {selectedAddress.province}, Việt Nam
              {selectedAddress.is_default && (
                <span className="ml-2 text-green-600">(Mặc định)</span>
              )}
            </span>
          ) : (
            <span className="text-gray-500">Chưa chọn địa chỉ</span>
          )}
        </div>
      </div>

      {/* Form thông tin */}
      <div className="grid grid-cols-1 desktop:grid-cols-2 laptop:grid-cols-2 gap-4">
        {/* Họ tên */}
        <div className="desktop:col-span-2 laptop:col-span-2">
          <label className="text-[1rem] font-medium">
            Họ và tên<span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            placeholder="Nhập họ và tên"
            className="w-full mt-2 py-[0.875rem] pl-3 border border-gray-300 rounded-md focus:outline-none"
          />
          {errors.fullName && (
            <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="text-[1rem] font-medium">
            Email<span className="text-red-600">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Nhập email"
            className="w-full mt-2 py-[0.875rem] pl-3 border border-gray-300 rounded-md focus:outline-none"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="text-[1rem] font-medium">
            Số điện thoại<span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Nhập số điện thoại"
            className="w-full mt-2 py-[0.875rem] pl-3 border border-gray-300 rounded-md focus:outline-none"
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
          )}
        </div>

        {/* Tỉnh */}
        <div>
          <label className="text-[1rem] font-medium">
            Tỉnh thành<span className="text-red-600">*</span>
          </label>
          <Select
            name="province"
            value={
              formData.province && !isLoading && provinces.length > 0
                ? { value: formData.province, label: formData.province }
                : null
            }
            onChange={(option) => customHandleSelectChange("province", option)}
            options={provinces.map((p) => ({
              value: p.name,
              label: p.name,
            }))}
            placeholder={
              isLoading || provinces.length === 0
                ? "Đang tải..."
                : "Chọn tỉnh thành"
            }
            className="mt-2"
            classNamePrefix="react-select"
            isClearable
            isDisabled={isLoading || provinces.length === 0}
          />
          {errors.province && (
            <p className="text-red-500 text-sm mt-1">{errors.province}</p>
          )}
          {provinces.length === 0 && !isLoading && (
            <p className="text-red-500 text-sm mt-1">
              Không tải được danh sách tỉnh thành
            </p>
          )}
        </div>

        {/* Phường xã */}
        <div>
          <label className="text-[1rem] font-medium">
            Phường xã<span className="text-red-600">*</span>
          </label>
          <Select
            name="ward"
            value={
              formData.ward
                ? { value: formData.ward, label: formData.ward }
                : null
            }
            onChange={(option) => customHandleSelectChange("ward", option)}
            options={wards.map((w) => ({
              value: w.name,
              label: w.name,
            }))}
            placeholder="Chọn phường xã"
            className="mt-2"
            classNamePrefix="react-select"
            isDisabled={!formData.province || wards.length === 0}
            isClearable
          />
          {errors.ward && (
            <p className="text-red-500 text-sm mt-1">{errors.ward}</p>
          )}
        </div>

        {/* Địa chỉ chi tiết */}
        <div>
          <label className="text-[1rem] font-medium">
            Địa chỉ<span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="Nhập địa chỉ cụ thể (số nhà, tên đường...)"
            className="w-full mt-2 py-[0.875rem] pl-3 border border-gray-300 rounded-md focus:outline-none"
          />
          {errors.address && (
            <p className="text-red-500 text-sm mt-1">{errors.address}</p>
          )}
        </div>
      </div>
    </div>
  );
}
