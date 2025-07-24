"use client";
import React from "react";
import Image from "next/image";

interface Props {
  orderId: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmCancelOrderModal({ onClose, onConfirm }: Props) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4">
      <div className="bg-white w-[500px] h-[508px] rounded-lg shadow-lg relative text-center flex flex-col items-center pt-[60px] px-6">
        {/* Nút đóng */}
        <button onClick={onClose} className="absolute top-4 right-4 text-black">
          <Image src="/profile/Group.png" alt="Đóng" width={20} height={20} />
        </button>

        {/* Logo */}
        <div className="mb-[40px]">
          <Image src="/nav/logo.svg" alt="GBOX logo" width={204} height={65} />
        </div>

        {/* Icon dấu X */}
        <div className="mb-[24px]">
          <Image
            src="/profile/modal/Capa_1.svg"
            alt="X icon"
            width={80}
            height={80}
          />
        </div>

        {/* Tiêu đề */}
        <h2 className="text-[24px] font-semibold text-[#0F172A] mb-2">
          Xác nhận hủy đơn hàng?{" "}
        </h2>

        {/* Mô tả */}
        <p className="text-[16px] text-[#64748B] leading-relaxed mb-[24px]">
          Bạn có chắc chắn muốn hủy đơn hàng hay không?
        </p>

        {/* Nút hành động */}
        <div className="flex gap-[24px]">
          <button
            onClick={onClose}
            className="w-[149px] h-[49px] border border-black rounded hover:bg-gray-100"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="w-[149px] h-[49px] bg-black text-white rounded hover:bg-gray-800"
          >
            Đồng ý
          </button>
        </div>
      </div>
    </div>
  );
}
