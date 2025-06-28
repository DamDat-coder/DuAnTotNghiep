"use client";

import { useEffect, useState } from "react";
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
  defaultAddress: Address | null; // Thêm prop
  setIsAddressPopupOpen: (isOpen: boolean) => void; // Thêm prop
  addresses: Address[]; // Thêm prop
}

export default function ShippingForm({
  formData,
  errors,
  handleInputChange,
  handleSelectChange,
  defaultAddress,
  setIsAddressPopupOpen,
  addresses,
}: ShippingFormProps) {
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

  const [isLoading, setIsLoading] = useState(true);

  // Đồng bộ provinceCode, districtCode với formData
  useEffect(() => {
    setIsLoading(true);
    if (provinces.length > 0) {
      // Tìm provinceCode từ formData.province
      const selectedProvince = provinces.find(
        (p) => p.name === formData.province
      );
      if (selectedProvince && selectedProvince.code !== provinceCode) {
        setProvinceCode(selectedProvince.code);
      }
      setIsLoading(false);
    }
  }, [provinces, formData.province, provinceCode, setProvinceCode]);

  useEffect(() => {
    if (districts.length > 0) {
      // Tìm districtCode từ formData.district
      const selectedDistrict = districts.find(
        (d) => d.name === formData.district
      );
      if (selectedDistrict && selectedDistrict.code !== districtCode) {
        setDistrictCode(selectedDistrict.code);
      }
    }
  }, [districts, formData.district, districtCode, setDistrictCode]);

  // Cập nhật handleSelectChange để set code
  const customHandleSelectChange = (name: string, option: any) => {
    handleSelectChange(name, option);
    if (name === "province") {
      setProvinceCode(
        option
          ? provinces.find((p) => p.name === option.value)?.code || null
          : null
      );
      setDistrictCode(null);
      setWardCode(null);
      handleSelectChange("district", null);
      handleSelectChange("ward", null);
    } else if (name === "district") {
      setDistrictCode(
        option
          ? districts.find((d) => d.name === option.value)?.code || null
          : null
      );
      setWardCode(null);
      handleSelectChange("ward", null);
    } else if (name === "ward") {
      setWardCode(
        option ? wards.find((w) => w.name === option.value)?.code || null : null
      );
    }
  };

  return (
    <div className="col-span-full">
      <h2 className="text-[18px] font-medium mb-4 desktop:text-[2rem] desktop:font-bold laptop:text-[2rem] laptop:font-bold">
        THÔNG TIN GIAO HÀNG
      </h2>
      <div className="mb-4 bg-gray-100">
        <div
          onClick={() => setIsAddressPopupOpen(true)}
          className="flex items-center py-[0.875rem] px-3 gap-2 cursor-pointer"
        >
          {defaultAddress ? (
            <span>
              {defaultAddress.street}, {defaultAddress.ward},{" "}
              {defaultAddress.district}, {defaultAddress.province}, Việt Nam
            </span>
          ) : (
            <span className="text-gray-500">Chưa có địa chỉ mặc định</span>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 desktop:grid-cols-2 laptop:grid-cols-2 gap-4">
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
        <div>
          <label className="text-[1rem] font-medium">
            Tỉnh thành<span className="text-red-600">*</span>
          </label>
          <Select
            name="province"
            value={
              formData.province
                ? { value: formData.province, label: formData.province }
                : null
            }
            onChange={(option) => customHandleSelectChange("province", option)}
            options={provinces.map((province) => ({
              value: province.name,
              label: province.name,
            }))}
            placeholder={isLoading ? "Đang tải..." : "Chọn tỉnh thành"}
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
        <div>
          <label className="text-[1rem] font-medium">
            Quận huyện<span className="text-red-600">*</span>
          </label>
          <Select
            name="district"
            value={
              formData.district
                ? { value: formData.district, label: formData.district }
                : null
            }
            onChange={(option) => customHandleSelectChange("district", option)}
            options={districts.map((district) => ({
              value: district.name,
              label: district.name,
            }))}
            placeholder="Chọn quận huyện"
            className="mt-2"
            classNamePrefix="react-select"
            isDisabled={!formData.province || districts.length === 0}
            isClearable
          />
          {errors.district && (
            <p className="text-red-500 text-sm mt-1">{errors.district}</p>
          )}
        </div>
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
            options={wards.map((ward) => ({
              value: ward.name,
              label: ward.name,
            }))}
            placeholder="Chọn phường xã"
            className="mt-2"
            classNamePrefix="react-select"
            isDisabled={!formData.district || wards.length === 0}
            isClearable
          />
          {errors.ward && (
            <p className="text-red-500 text-sm mt-1">{errors.ward}</p>
          )}
        </div>
        <div>
          <label className="text-[1rem] font-medium">
            Địa chỉ<span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="Nhập địa chỉ"
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
