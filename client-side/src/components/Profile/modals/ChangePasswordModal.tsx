"use client";
import React from "react";
import Image from "next/image";
interface Props {
  onClose: () => void;
}

export default function ChangePasswordModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white w-[536px] h-[400px] rounded-lg shadow-lg px-[48px] pt-[36px] pb-[24px] relative">
        {/* Tiêu đề + Nút đóng */}
        <div className="flex items-center justify-between mb-[24px]">
          <h2 className="text-[24px] font-bold text-black leading-[36px]">
            Đổi mật khẩu
          </h2>
          <button
            onClick={onClose}
            className="w-[36px] h-[36px] rounded-full bg-[#F5F5F5] flex items-center justify-center text-[20px] font-bold"
          >
            <Image
              src="/profile/close.svg"
              width={20}
              height={20}
              alt="close"
            />
          </button>
        </div>

        {/* Inputs */}
        <input
          type="password"
          placeholder="Nhập mật khẩu cũ*"
          className="w-[440px] h-[40px] rounded-[8px] border border-[#E5E7EB] px-3 mb-[24px] text-sm"
        />
        <input
          type="password"
          placeholder="Nhập mật khẩu mới*"
          className="w-[440px] h-[40px] rounded-[8px] border border-[#E5E7EB] px-3 mb-[24px] text-sm"
        />
        <input
          type="password"
          placeholder="Nhập lại mật khẩu mới*"
          className="w-[440px] h-[40px] rounded-[8px] border border-[#E5E7EB] px-3 mb-[36px] text-sm"
        />

        {/* Nút lưu */}
        <button className="w-[440px] h-[40px] bg-black text-[#F5F5F5] rounded-[8px] text-sm hover:bg-opacity-90">
          Lưu thay đổi
        </button>
      </div>
    </div>
  );
}
