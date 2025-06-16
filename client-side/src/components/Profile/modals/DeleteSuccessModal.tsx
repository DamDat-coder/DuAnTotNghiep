"use client";
import React from "react";
import Image from "next/image";

interface Props {
  onClose: () => void;
}

export default function DeleteSuccessModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4">
      <div className="bg-white w-[500px] h-[483px] rounded-lg shadow-lg relative text-center flex flex-col items-center justify-start pt-[60px]">
        {/* Nút đóng */}
        <button onClick={onClose} className="absolute top-4 right-4 text-black">
          <Image src="/profile/Group.png" alt="Đóng" width={20} height={20} />
        </button>

        {/* Logo */}
        <div className="mb-[40px]">
          <Image
            src="/profile/modal/image 689.png"
            alt="GBOX logo"
            width={204}
            height={65}
          />
        </div>

        {/* Icon thùng rác */}
        <div className="mb-[24px]">
          <Image
            src="/profile/modal/icon delete.svg"
            alt="Icon delete"
            width={80}
            height={80}
          />
        </div>

        {/* Tiêu đề */}
        <h2 className="text-[24px] font-semibold text-[#0F172A] mb-1">
          Xóa tài khoản thành công
        </h2>

        {/* Mô tả */}
        <p className="text-[18px] text-[#94A3B8] mb-6">
          Tài khoản của bạn đã bị xóa
        </p>

        {/* Nút quay lại */}
        <button
          onClick={onClose}
          className="bg-[#1E293B] text-white w-[180px] h-[49px] rounded hover:bg-opacity-90"
        >
          Quay lại trang chủ
        </button>
      </div>
    </div>
  );
}
