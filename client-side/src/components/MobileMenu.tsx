// src/components/MobileMenu.tsx
"use client";

import React from "react";

interface MobileMenuProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function MobileMenu({ isOpen, setIsOpen }: MobileMenuProps) {
  return (
    <div
      className={`fixed flex px-6 flex-col gap-9 inset-0 text-black bg-white transform transition-transform duration-300 ease-in-out z-50 tablet:hidden ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Nút đóng */}
      <button
        type="button"
        className="absolute top-4 right-4 p-2 text-black hover:text-gray-800 focus:ring-2 focus:ring-black focus:outline-none"
        onClick={() => setIsOpen(false)}
      >
        <svg
          className="size-8"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18 18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Danh sách link */}
      <div className="flex flex-col pt-16 items-start space-y-4">
        <a
          href="#"
          className="text-2xl font-medium w-[100%] text-black desktop:hover:bg-gray-700  py-2 rounded"
          onClick={() => setIsOpen(false)}
        >
          Trang chủ
        </a>
        <a
          href="#"
          className="text-2xl font-medium text-black desktop:hover:bg-gray-700  py-2 rounded flex justify-between w-[100%] items-center"
          onClick={() => setIsOpen(false)}
        >
          Sản phẩm
          <img src="/product/angle_left.svg" alt="" />
        </a>
        <a
          href="#"
          className="text-2xl font-medium w-[100%] text-black desktop:hover:bg-gray-700  py-2 rounded"
          onClick={() => setIsOpen(false)}
        >
          Dịch vụ
        </a>
        <a
          href="#"
          className="text-2xl font-medium w-[100%] text-black desktop:hover:bg-gray-700  py-2 rounded"
          onClick={() => setIsOpen(false)}
        >
          Về chúng tôi
        </a>
      </div>

      <div className="flex flex-col gap-6">
        <img className="w-[40%]" src="/nav/logo.svg" alt="" />
        <p className="text-lg">Trở thành thành viên Nike để có được những sản phẩm và giá tốt nhất</p>
        <div className="flex justify-center gap-2">
            <div className="bg-black text-white p-3 rounded-full"><a href="#">Đăng ký</a></div>
            <div className="p-3 rounded-full border border-black"><a href="#">Đăng nhập</a></div>
        </div>
      </div>
    </div>
  );
}
