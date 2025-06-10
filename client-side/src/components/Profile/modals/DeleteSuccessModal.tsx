"use client";
import React from "react";
import Image from "next/image";

interface Props {
  onClose: () => void;
}

export default function DeleteSuccessModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6 relative text-center">
        {/* Nút đóng */}
        <button onClick={onClose} className="absolute top-4 right-4 text-black">
          <Image src="/profile/Group.png" alt="Đóng" width={20} height={20} />
        </button>

        {/* Logo */}
        <div className="mb-4">
          <Image
            src="/nav/logo.svg"
            alt="GBOX logo"
            width={180}
            height={60}
            className="mx-auto"
          />
        </div>

        {/* Icon thành công */}
        <div className="mb-4">
          <Image
            src="/profile/modal/icon delete.svg"
            alt="Icon delete"
            width={60}
            height={60}
            className="mx-auto"
          />
        </div>

        {/* Tiêu đề */}
        <h2 className="text-lg font-semibold text-[#0F172A] mb-2">
          Xóa tài khoản thành công
        </h2>

        {/* Mô tả */}
        <p className="text-sm text-gray-600 mb-6">
          Tài khoản của bạn đã bị xóa
        </p>

        {/* Nút */}
        <button
          onClick={onClose}
          className="bg-[#1E293B] text-white px-6 py-2 rounded hover:bg-opacity-90"
        >
          Quay lại trang chủ
        </button>
      </div>
    </div>
  );
}
