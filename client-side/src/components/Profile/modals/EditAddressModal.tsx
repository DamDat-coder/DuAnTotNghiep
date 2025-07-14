"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useAddressData } from "@/hooks/useAddressData";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { updateAddress } from "@/services/userApi";
import { Address } from "@/types/auth";

interface Props {
  address: Address;
  onClose: () => void;
  onEdit: (updatedAddress: Address) => void;
}

export default function EditAddressModal({ address, onClose, onEdit }: Props) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    street: address.street,
    province: address.province,
    district: address.district,
    ward: address.ward,
    isDefaultAddress: address.is_default,
  });
  const {
    provinces,
    districts,
    wards,
    provinceCode,
    districtCode,
    wardCode,
    setProvinceCode,
    setDistrictCode,
    setWardCode,
    isLoadingProvinces,
    isLoadingDistricts,
    isLoadingWards,
  } = useAddressData();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Khởi tạo provinceCode, districtCode, wardCode dựa trên địa chỉ
  useEffect(() => {
    if (!isLoadingProvinces && provinces.length > 0) {
      const selectedProvince = provinces.find(
        (p) => p.name === address.province
      );
      if (selectedProvince) {
        setProvinceCode(selectedProvince.code);
      }
    }
  }, [provinces, isLoadingProvinces, setProvinceCode, address.province]);

  useEffect(() => {
    if (!isLoadingDistricts && districts.length > 0) {
      const selectedDistrict = districts.find(
        (d) => d.name === address.district
      );
      if (selectedDistrict) {
        setDistrictCode(selectedDistrict.code);
      }
    }
  }, [districts, isLoadingDistricts, setDistrictCode, address.district]);

  useEffect(() => {
    if (!isLoadingWards && wards.length > 0) {
      const selectedWard = wards.find((w) => w.name === address.ward);
      if (selectedWard) {
        setWardCode(selectedWard.code);
      }
    }
  }, [wards, isLoadingWards, setWardCode, address.ward]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "province") {
      const selectedProvince = provinces.find((p) => p.name === value);
      setProvinceCode(selectedProvince?.code ?? null);
      setFormData((prev) => ({ ...prev, district: "", ward: "" }));
      setDistrictCode(null);
      setWardCode(null);
    } else if (name === "district") {
      const selectedDistrict = districts.find((d) => d.name === value);
      setDistrictCode(selectedDistrict?.code ?? null);
      setFormData((prev) => ({ ...prev, ward: "" }));
      setWardCode(null);
    } else if (name === "ward") {
      const selectedWard = wards.find((w) => w.name === value);
      setWardCode(selectedWard?.code ?? null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user?.id) {
      toast.error("Vui lòng đăng nhập để chỉnh sửa địa chỉ.");
      return;
    }

    if (!formData.province) {
      toast.error("Vui lòng chọn tỉnh/thành phố.");
      return;
    }
    if (!formData.district) {
      toast.error("Vui lòng chọn quận/huyện.");
      return;
    }
    if (!formData.ward) {
      toast.error("Vui lòng chọn phường/xã.");
      return;
    }
    if (!formData.street) {
      toast.error("Vui lòng nhập địa chỉ.");
      return;
    }

    setIsSubmitting(true);

    const addressData = {
      street: formData.street,
      ward: formData.ward,
      district: formData.district,
      province: formData.province,
      is_default: formData.isDefaultAddress,
    };

    try {
      const result = await updateAddress(user.id, address._id, addressData);
      if (result) {
        toast.success("Chỉnh sửa địa chỉ thành công!");
        onEdit({
          _id: address._id,
          street: addressData.street,
          ward: addressData.ward,
          district: addressData.district,
          province: addressData.province,
          is_default: addressData.is_default,
        });
        onClose();
      } else {
        toast.error("Chỉnh sửa địa chỉ thất bại. Vui lòng thử lại.");
      }
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra khi chỉnh sửa địa chỉ.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    formData.street && formData.province && formData.district && formData.ward;

  if (isLoadingProvinces || isLoadingDistricts || isLoadingWards) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4">
        <div className="bg-white w-[536px] rounded-lg shadow-lg p-[48px] relative">
          <div>Đang tải dữ liệu địa chỉ...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4">
      <div className="bg-white w-[536px] rounded-lg shadow-lg p-[48px] relative">
        <div className="flex justify-between items-center mb-[24px]">
          <h2 className="text-[24px] font-bold text-black leading-[36px]">
            Chỉnh sửa địa chỉ
          </h2>
          <button
            onClick={onClose}
            className="w-[36px] h-[36px] rounded-full bg-[#F5F5F5] flex items-center justify-center"
          >
            <Image src="/profile/Group.png" alt="Đóng" width={20} height={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col items-center">
          <input
            type="text"
            name="street"
            placeholder="Địa chỉ"
            value={formData.street}
            onChange={handleChange}
            className="w-[440px] h-[47px] px-3 border border-gray-300 rounded-[4px] mb-[16px] text-sm"
            required
          />

          <div className="relative w-[440px] mb-[16px]">
            <select
              name="province"
              value={formData.province}
              onChange={handleChange}
              className="w-full h-[47px] px-3 pr-10 border border-gray-300 rounded-[4px] text-sm text-gray-600 appearance-none"
              required
            >
              <option value="">Chọn tỉnh / thành</option>
              {provinces.map((item) => (
                <option key={item.code} value={item.name}>
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

          <div className="relative w-[440px] mb-[16px]">
            <select
              name="district"
              value={formData.district}
              onChange={handleChange}
              disabled={!formData.province}
              className="w-full h-[47px] px-3 pr-10 border border-gray-300 rounded-[4px] text-sm text-gray-600 appearance-none"
              required
            >
              <option value="">Chọn quận / huyện</option>
              {districts.map((item) => (
                <option key={item.code} value={item.name}>
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

          <div className="relative w-[440px] mb-[16px]">
            <select
              name="ward"
              value={formData.ward}
              onChange={handleChange}
              disabled={!formData.district}
              className="w-full h-[47px] px-3 pr-10 border border-gray-300 rounded-[4px] text-sm text-gray-600 appearance-none"
              required
            >
              <option value="">Chọn phường / xã</option>
              {wards.map((item) => (
                <option key={item.code} value={item.name}>
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

          <label className="flex items-center w-[440px] mb-[16px]">
            <input
              type="checkbox"
              name="isDefaultAddress"
              checked={formData.isDefaultAddress}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  isDefaultAddress: e.target.checked,
                }))
              }
              className="mr-2"
            />
            Đặt làm địa chỉ mặc định
          </label>

          <button
            type="submit"
            disabled={isSubmitting || !isFormValid}
            className={`w-[440px] h-[40px] mt-[36px] rounded-[8px] text-sm text-[#F5F5F5] ${
              isSubmitting || !isFormValid
                ? "bg-gray-400"
                : "bg-black hover:bg-opacity-90"
            }`}
          >
            {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </form>
      </div>
    </div>
  );
}
