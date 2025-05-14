// src/components/ShippingForm.tsx
import dynamic from "next/dynamic";
import { CheckoutFormData, CheckoutErrors } from "@/types";

// Tắt SSR cho react-select
const Select = dynamic(() => import("react-select"), { ssr: false });

interface ShippingFormProps {
  formData: CheckoutFormData;
  errors: CheckoutErrors;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, option: any) => void;
}

const provinces = ["TP HCM", "Hà Nội", "Đà Nẵng"];
const districtsByProvince: { [key: string]: string[] } = {
  "TP HCM": ["Quận 1", "Quận 3", "Quận 7", "Quận Bình Thạnh", "Quận Gò Vấp"],
  "Hà Nội": ["Ba Đình", "Hoàn Kiếm", "Cầu Giấy"],
  "Đà Nẵng": ["Hải Châu", "Thanh Khê", "Sơn Trà"],
};
const wardsByDistrict: { [key: string]: string[] } = {
  "Quận 1": ["Phường Bến Nghé", "Phường Bến Thành", "Phường Đa Kao"],
  "Quận 3": ["Phường 1", "Phường 2", "Phường Võ Thị Sáu"],
  "Quận 7": ["Phường Tân Phú", "Phường Tân Thuận Đông", "Phường Tân Quy"],
  "Quận Bình Thạnh": ["Phường 1", "Phường 13", "Phường 25"],
  "Quận Gò Vấp": ["Phường 1", "Phường 3", "Phường 5"],
  "Ba Đình": ["Phường Trúc Bạch", "Phường Vĩnh Phúc"],
  "Hoàn Kiếm": ["Phường Hàng Bông", "Phường Hàng Gai"],
  "Cầu Giấy": ["Phường Dịch Vọng", "Phường Mai Dịch"],
  "Hải Châu": ["Phường Hòa Cường Bắc", "Phường Hòa Thuận Đông"],
  "Thanh Khê": ["Phường Thanh Khê Đông", "Phường Thanh Khê Tây"],
  "Sơn Trà": ["Phường An Hải Bắc", "Phường An Hải Đông"],
};

export default function ShippingForm({
  formData,
  errors,
  handleInputChange,
  handleSelectChange,
}: ShippingFormProps) {
  return (
    <div className="col-span-full">
      <h2 className="text-[18px] font-medium mb-4 desktop:text-[2rem] desktop:font-bold  laptop:text-[2rem] laptop:font-bold">
        THÔNG TIN GIAO HÀNG
      </h2>
      <div className="grid grid-cols-1 desktop:grid-cols-2 laptop:grid-cols-2 gap-4">
        <div>
          <label className="text-[1rem] font-medium uppercase">Họ và tên</label>
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
          <label className="text-[1rem] font-medium uppercase">Email</label>
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
          <label className="text-[1rem] font-medium uppercase">Số điện thoại</label>
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
          <label className="text-[1rem] font-medium uppercase">Tỉnh thành</label>
          <Select
            name="province"
            value={
              formData.province
                ? { value: formData.province, label: formData.province }
                : null
            }
            onChange={(option) => handleSelectChange("province", option)}
            options={provinces.map((province) => ({
              value: province,
              label: province,
            }))}
            placeholder="Chọn tỉnh thành"
            className="mt-2"
            classNamePrefix="react-select"
            isClearable
          />
          {errors.province && (
            <p className="text-red-500 text-sm mt-1">{errors.province}</p>
          )}
        </div>
        <div>
          <label className="text-[1rem] font-medium uppercase">Quận huyện</label>
          <Select
            name="district"
            value={
              formData.district
                ? { value: formData.district, label: formData.district }
                : null
            }
            onChange={(option) => handleSelectChange("district", option)}
            options={
              formData.province
                ? districtsByProvince[formData.province]?.map((district) => ({
                    value: district,
                    label: district,
                  }))
                : []
            }
            placeholder="Chọn quận huyện"
            className="mt-2"
            classNamePrefix="react-select"
            isDisabled={!formData.province}
            isClearable
          />
          {errors.district && (
            <p className="text-red-500 text-sm mt-1">{errors.district}</p>
          )}
        </div>
        <div>
          <label className="text-[1rem] font-medium uppercase">Phường xã</label>
          <Select
            name="ward"
            value={formData.ward ? { value: formData.ward, label: formData.ward } : null}
            onChange={(option) => handleSelectChange("ward", option)}
            options={
              formData.district
                ? wardsByDistrict[formData.district]?.map((ward) => ({
                    value: ward,
                    label: ward,
                  }))
                : []
            }
            placeholder="Chọn phường xã"
            className="mt-2"
            classNamePrefix="react-select"
            isDisabled={!formData.district}
            isClearable
          />
          {errors.ward && (
            <p className="text-red-500 text-sm mt-1">{errors.ward}</p>
          )}
        </div>
        <div className="desktop:col-span-2 laptop:col-span-2">
          <label className="text-[1rem] font-medium uppercase">Địa chỉ</label>
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