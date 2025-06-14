"use client";

import { useState } from "react";
import Image from "next/image";

interface AddSaleModalProps {
  onClose: () => void;
}

export default function AddSaleModal({ onClose }: AddSaleModalProps) {
  const [form, setForm] = useState({
    code: "",
    category: "",
    type: "%",
    value: "",
    minOrder: "",
    maxDiscount: "",
    startDate: "",
    endDate: "",
    usage: "",
    status: "active",
    description: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white rounded-br-[16px] rounded-bl-[16px] shadow-xl w-[613px] max-w-full max-h-[90vh] overflow-y-auto pb-10 relative">
        {/* Header */}
        <div className="pl-6 pr-6">
          <div className="flex justify-between items-center h-[73px] mb-3">
            <h2 className="text-lg font-bold">Thêm Mã Giảm Giá Mới</h2>
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
        <div className="w-full h-px bg-[#E7E7E7]" />
        {/* Form */}
        <div className="pl-6 pr-6">
          <form className="text-sm">
            <div className="mt-3 mb-8">
              <label className="block font-bold mb-4">
                Mã khuyến mãi<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                name="code"
                value={form.code}
                onChange={handleChange}
                placeholder="Nhập tên mã km"
                className="w-full h-[56px] px-4 border border-[#E2E8F0] rounded-[12px]"
              />
            </div>

            <div className="mb-8 relative">
              <label className="block font-bold mb-4">
                Danh mục áp dụng<span className="text-red-500 ml-1">*</span>
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full h-[56px] px-4 border border-[#E2E8F0] rounded-[12px] appearance-none"
              >
                <option value="">Chọn danh mục</option>
                <option value="men">Nam</option>
                <option value="women">Nữ</option>
              </select>
              <Image
                src="/admin_user/chevron-down.svg"
                width={20}
                height={20}
                alt="arrow down"
                className="absolute right-3 top-[calc(50%+19px)] transform -translate-y-1/2 pointer-events-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="relative">
                <label className="block font-bold mb-4">Loại giảm giá</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full h-[56px] px-4 border border-[#E2E8F0] rounded-[12px] appearance-none"
                >
                  <option value="%">Phần trăm (%)</option>
                  <option value="vnd">Tiền (đ)</option>
                </select>
                <Image
                  src="/admin_user/Vector.svg"
                  width={14}
                  height={14}
                  alt="arrow down"
                  className="absolute right-3 top-[calc(50%+19px)] transform -translate-y-1/2 pointer-events-none"
                />
              </div>

              <div>
                <label className="block font-bold mb-4">
                  Giá trị giảm<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  name="value"
                  value={form.value}
                  onChange={handleChange}
                  placeholder="Vd: 20 hoặc 50000"
                  className="w-full h-[56px] px-4 border border-[#E2E8F0] rounded-[12px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div>
                <label className="block font-bold mb-4">
                  {" "}
                  Đơn tối thiểu (đ)
                </label>
                <input
                  name="minOrder"
                  value={form.minOrder}
                  onChange={handleChange}
                  placeholder="Vd: 50000"
                  className="w-full h-[56px] px-4 border border-[#E2E8F0] rounded-[12px]"
                />
              </div>
              <div>
                <label className="block font-bold mb-4">Giảm tối đa (đ)</label>
                <input
                  name="maxDiscount"
                  value={form.maxDiscount}
                  onChange={handleChange}
                  placeholder="Vd: 50000"
                  className="w-full h-[56px] px-4 border border-[#E2E8F0] rounded-[12px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {/* Ngày bắt đầu */}
              <div className="relative">
                <label className="block font-bold mb-4">
                  Ngày bắt đầu<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                  className="w-full h-[46px] px-4 pr-10 border border-[#D1D1D1] rounded-[12px] appearance-none"
                />
                <Image
                  src="/admin_sale/date.svg"
                  width={18}
                  height={18}
                  alt="calendar"
                  className="absolute right-3 top-[calc(50%+18px)] transform -translate-y-1/2 pointer-events-none"
                />
              </div>

              {/* Ngày kết thúc */}
              <div className="relative">
                <label className="block font-bold mb-4">
                  Ngày kết thúc<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                  className="w-full h-[46px] px-4 pr-10 border border-[#D1D1D1] rounded-[12px] appearance-none"
                />
                <Image
                  src="/admin_sale/date.svg"
                  width={18}
                  height={18}
                  alt="calendar"
                  className="absolute right-3 top-[calc(50%+18px)] transform -translate-y-1/2 pointer-events-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div>
                <label className="block font-bold mb-4">
                  Lượt dùng<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  name="usage"
                  value={form.usage}
                  onChange={handleChange}
                  placeholder="Vd: 200"
                  className="w-full h-[56px] px-4 border border-[#E2E8F0] rounded-[12px]"
                />
              </div>
              <div className="relative">
                <label className="block font-bold mb-4">
                  Trạng thái<span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full h-[56px] px-4 border border-[#E2E8F0] rounded-[12px] appearance-none"
                >
                  <option value="active">Kích hoạt</option>
                  <option value="inactive">Tạm ngừng</option>
                </select>
                <Image
                  src="/admin_user/Vector.svg"
                  width={14}
                  height={14}
                  alt="arrow down"
                  className="absolute right-3 top-[calc(50%+19px)] transform -translate-y-1/2 pointer-events-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold mb-4">
                Mô tả chương trình<span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Nhập nội dung chương trình, điều kiện áp dụng..."
                className="w-full min-h-[200px] px-4 py-3 border border-[#E2E8F0] rounded-[12px]"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-black text-white h-[56px] rounded-lg font-semibold hover:opacity-90 mt-4"
            >
              Thêm mã giảm giá
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
