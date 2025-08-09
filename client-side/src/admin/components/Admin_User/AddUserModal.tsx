"use client";

import { useState } from "react";
import Image from "next/image";

interface AddUserModalProps {
  onClose: () => void;
}

export default function AddUserModal({ onClose }: AddUserModalProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    ward: "",
    address: "",
    role: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white rounded-br-[16px] rounded-bl-[16px] shadow-xl w-[613px] max-w-full max-h-[90vh] overflow-y-auto pb-10 relative">
        {/* Header */}
        <div className="pl-6 pr-6">
          <div className="flex justify-between items-center h-[73px]">
            <h2 className="text-lg font-semibold">Thêm người dùng mới</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-[#F8FAFC] rounded-[8px] flex items-center justify-center"
            >
              <Image
                src="/admin_user/group.svg"
                width={10}
                height={10}
                alt="close"
              />
            </button>
          </div>
        </div>
        <div className="w-full h-px bg-[#E7E7E7] mb-3" />
        {/* Form */}
        <div className="pl-6 pr-6">
          <form className="space-y-5 text-sm">
            {/* Họ tên */}
            <div className="mb-8">
              <label className="block font-bold mb-4">
                Họ tên<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Nhập họ tên"
                className="w-full h-[56px] px-4 border border-[#E2E8F0] rounded-[12px] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Email */}
            <div className="mb-8">
              <label className="block mb-4 font-bold">
                Email<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Nhập email"
                className="w-full h-[56px] px-4 border border-[#E2E8F0] rounded-[12px]"
              />
            </div>

            {/* Số điện thoại */}
            <div className="mb-8">
              <label className="block font-bold mb-4">Số điện thoại</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Nhập số điện thoại"
                className="w-full h-[56px] px-4 border border-[#E2E8F0] rounded-[12px]"
              />
            </div>

            {/* Nhập địa chỉ */}
            <div className="mb-8">
              <label className="block font-semibold mb-4">Nhập địa chỉ</label>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="relative">
                  <label className="text-gray-500 text-sm mb-1 block">
                    Tỉnh / Thành
                  </label>

                  <div>
                    <select
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      className="w-full h-[56px] px-4 pr-10 border border-[#B0B0B0] rounded-[4px] appearance-none"
                    >
                      <option value="">Chọn tỉnh / thành</option>
                      <option value="hanoi">Hà Nội</option>
                      <option value="hcm">TP. Hồ Chí Minh</option>
                    </select>

                    <Image
                      src="/admin_user/Vector.svg"
                      width={14}
                      height={14}
                      alt="arrow down"
                      className="absolute right-3 top-[calc(50%+10px)] transform -translate-y-1/2 pointer-events-none"
                    />
                  </div>
                </div>

              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="text-gray-500 text-sm mb-1 block">
                    Phường / Xã
                  </label>
                  <select
                    name="ward"
                    value={form.ward}
                    onChange={handleChange}
                    className="w-full h-[56px] px-4 border border-[#B0B0B0] rounded-[4px] appearance-none"
                  >
                    <option value="">Chọn phường / xã</option>
                  </select>
                  <Image
                    src="/admin_user/Vector.svg"
                    width={14}
                    height={14}
                    alt="arrow down"
                    className="absolute right-3 top-[calc(50%+10px)] transform -translate-y-1/2 pointer-events-none"
                  />
                </div>
                <div>
                  <label className="text-gray-500 text-sm mb-1 block">
                    Địa chỉ
                  </label>
                  <input
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Địa chỉ"
                    className="w-full h-[56px] px-4 border border-[#888888] rounded-[4px]"
                  />
                </div>
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block font-bold mb-2">
                Role<span className="text-red-500 ml-1">*</span>
              </label>

              <div className="relative">
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full h-[56px] px-4 pr-10 border border-[#E2E8F0] rounded-lg appearance-none"
                >
                  <option value="">Chọn role</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>

                <Image
                  src="/admin_user/chevron-down.svg"
                  width={20}
                  height={20}
                  alt="arrow down"
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-black text-white h-[56px] rounded-lg font-semibold hover:opacity-90 mt-6"
            >
              Thêm người dùng
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
