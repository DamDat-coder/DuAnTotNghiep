// src/components/MobileMenu.tsx
"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
interface MobileMenuProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function MobileMenu({ isOpen, setIsOpen }: MobileMenuProps) {
  // Chặn cuộn trang chính khi MobileMenu mở
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    // Cleanup khi component unmount hoặc isOpen thay đổi
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isOpen]);

  return (
    <div
      className={`fixed inset-0 text-black bg-white transform transition-transform duration-300 ease-in-out z-50 tablet:hidden flex flex-col ${
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

      {/* Nội dung menu */}
      <div className="flex-1 px-6 pt-16 pb-6 flex flex-col gap-9 overflow-y-auto">
        <div className="flex gap-3 items-center ">
          <Image
            src={`/nav/nav_user.svg`}
            alt={"Sản phẩm"}
            width={32}
            height={32}
            className="object-cover"
            draggable={false}
            loading="lazy"
          />
          <p className="font-medium text-2xl">Hi, Hà</p>
        </div>
        {/* Danh sách link */}
        <div className="flex flex-col items-start gap-4">
          <Link
            href="/"
            className="text-2xl font-medium w-full text-black desktop:hover:bg-gray-700 py-2 rounded flex items-center justify-between"
            onClick={() => setIsOpen(false)}
          >
            Trang chủ
            <Image
              src={`/nav/nav_angle_left.svg`}
              alt={"Sản phẩm"}
              width={8}
              height={16}
              className="object-cover"
              draggable={false}
              loading="lazy"
            />
          </Link>
          <Link
            href="/"
            className="text-2xl font-medium w-full text-black desktop:hover:bg-gray-700 py-2 rounded flex items-center justify-between"
            onClick={() => setIsOpen(false)}
          >
            Unisex
            <Image
              src={`/nav/nav_angle_left.svg`}
              alt={"Sản phẩm"}
              width={8}
              height={16}
              className="object-cover"
              draggable={false}
              loading="lazy"
            />
          </Link>
          <Link
            href="/"
            className="text-2xl font-medium w-full text-black desktop:hover:bg-gray-700 py-2 rounded flex items-center justify-between"
            onClick={() => setIsOpen(false)}
          >
            Nam
            <Image
              src={`/nav/nav_angle_left.svg`}
              alt={"Sản phẩm"}
              width={8}
              height={16}
              className="object-cover"
              draggable={false}
              loading="lazy"
            />
          </Link>
          <Link
            href="/"
            className="text-2xl font-medium w-full text-black desktop:hover:bg-gray-700 py-2 rounded flex items-center justify-between"
            onClick={() => setIsOpen(false)}
          >
            Nữ
            <Image
              src={`/nav/nav_angle_left.svg`}
              alt={"Sản phẩm"}
              width={8}
              height={16}
              className="object-cover"
              draggable={false}
              loading="lazy"
            />
          </Link>
          <Link
            href="/"
            className="text-2xl font-medium w-full text-black desktop:hover:bg-gray-700 py-2 rounded flex items-center justify-between"
            onClick={() => setIsOpen(false)}
          >
            Giảm giá
            <Image
              src={`/nav/nav_angle_left.svg`}
              alt={"Sản phẩm"}
              width={8}
              height={16}
              className="object-cover"
              draggable={false}
              loading="lazy"
            />
          </Link>
          <Link
            href="/"
            className="text-2xl font-medium w-full text-black desktop:hover:bg-gray-700 py-2 rounded flex items-center justify-between"
            onClick={() => setIsOpen(false)}
          >
            Bài viết
          </Link>
        </div>

        <div className="flex flex-col gap-6">
          <img className="w-[40%]" src="/nav/logo.svg" alt="" />
          <p className="text-lg">
            Trở thành thành viên Nike để có được những sản phẩm và giá tốt nhất
          </p>
          <div className="flex justify-center gap-2">
            <div className="bg-black text-white p-3 rounded-full">
              <a href="#">Đăng ký</a>
            </div>
            <div className="p-3 rounded-full border border-black">
              <a href="#">Đăng nhập</a>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <Image
              src={`/nav/nav_like.svg`}
              alt={"Sản phẩm"}
              width={18}
              height={18}
              draggable={false}
              loading="lazy"
            />
            <p className="font-medium text-2xl">Yêu thích</p>
          </div>
          <div className="flex items-center gap-4">
            <Image
              src={`/nav/nav_cart.svg`}
              alt={"Sản phẩm"}
              width={24}
              height={24}
              draggable={false}
              loading="lazy"
            />
            <p className="font-medium text-2xl">Giỏ hàng</p>
          </div>
        </div>
      </div>
    </div>
  );
}
