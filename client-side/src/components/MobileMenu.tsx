"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import LoginPopup from "./LoginPopup";
import RegisterPopup from "./RegisterPopup";

interface MobileMenuProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function MobileMenu({ isOpen, setIsOpen }: MobileMenuProps) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isOpen]);

  return (
    <>
      <div
        className={`fixed inset-0 text-black bg-white transform transition-transform duration-300 ease-in-out z-50 tablet:hidden flex flex-col ${
          isOpen ? "translate-x-0" : "hidden"
        }`}
      >
        {/* Nội dung giữ nguyên */}
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

        <div className="flex-1 px-6 pt-16 pb-6 flex flex-col gap-9 overflow-y-auto">
          <div className="flex gap-3 items-center">
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
          <div className="flex flex-col items-start gap-4">
            <a
              href="#"
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
            </a>
            <a
              href="#"
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
            </a>
            <a
              href="#"
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
            </a>
            <a
              href="#"
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
            </a>
            <a
              href="#"
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
            </a>
            <a
              href="#"
              className="text-2xl font-medium w-full text-black desktop:hover:bg-gray-700 py-2 rounded flex items-center justify-between"
              onClick={() => setIsOpen(false)}
            >
              Bài viết
            </a>
          </div>

          <div className="flex flex-col gap-6">
            <img className="w-[40%]" src="/nav/logo.svg" alt="" />
            <p className="text-lg">
              Trở thành thành viên Nike để có được những sản phẩm và giá tốt
              nhất
            </p>
            <div className="flex justify-center gap-2">
              <button
                className="bg-black text-white p-3 rounded-full"
                onClick={() => {
                  setIsRegisterOpen(true);
                  setIsOpen(false);
                }}
              >
                Đăng ký
              </button>
              <button
                className="p-3 rounded-full border border-black"
                onClick={() => {
                  setIsLoginOpen(true);
                  setIsOpen(false);
                }}
              >
                Đăng nhập
              </button>
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
      <LoginPopup
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onOpenRegister={() => setIsRegisterOpen(true)}
      />
      <RegisterPopup
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onOpenLogin={() => setIsLoginOpen(true)}
      />
    </>
  );
}
