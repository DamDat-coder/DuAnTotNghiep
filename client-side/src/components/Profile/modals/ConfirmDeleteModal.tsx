"use client";
import React from "react";
import Image from "next/image";

interface Props {
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmDeleteModal({ onClose, onConfirm }: Props) {
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

        {/* Icon confirm */}
        <div className="mb-4">
          <Image
            src="/profile/modal/Capa_1.svg"
            alt="X icon"
            width={60}
            height={60}
            className="mx-auto"
          />
        </div>

        {/* Tiêu đề */}
        <h2 className="text-lg font-semibold mb-2">Xác nhận xóa tài khoản?</h2>

        {/* Mô tả */}
        <p className="text-sm text-gray-600 leading-relaxed">
          Bạn có chắc chắn xóa tài khoản?
          <br />
          Thao tác này không thể khôi phục.
        </p>

        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={onClose}
            className="w-[180px] py-2 border border-black rounded hover:bg-gray-100"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="w-[180px] py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            Đồng ý
          </button>
        </div>
      </div>
    </div>
  );
}
