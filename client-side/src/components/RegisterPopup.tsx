// src/components/RegisterPopup.tsx
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

interface RegisterPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void; // Thêm props để mở LoginPopup
}

export default function RegisterPopup({ isOpen, onClose, onOpenLogin }: RegisterPopupProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        className="absolute inset-0 bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
      />
      <motion.div
        className="relative bg-white p-6 rounded-lg shadow-lg w-full max-w-md"
        initial={{ y: "-100vh" }}
        animate={{ y: 0 }}
        exit={{ y: "-100vh" }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        <button
          type="button"
          className="absolute top-4 right-4 p-2 text-black hover:text-gray-800 focus:ring-2 focus:ring-black focus:outline-none"
          onClick={onClose}
        >
          <svg
            className="size-6"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col gap-6">
          <div className="mt-8 flex justify-center">
            <Image
              src="/nav/logo.svg"
              alt="Logo"
              width={0}
              height={0}
              className="h-8 w-auto"
              draggable={false}
              loading="lazy"
            />
          </div>
          <div>
            <h2 className="text-2xl font-medium text-center">Đăng ký</h2>
            <p className="text-base text-[#707070] text-center">
              Trở thành thành viên để có được những sản phẩm và giá tốt nhất.
            </p>
          </div>
          <form className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium">Email hoặc Số điện thoại</label>
              <input
                type="text"
                className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Nhập email hoặc số điện thoại"
              />
            </div>
            <div className="relative">
              <label className="block text-sm font-medium">Mật khẩu</label>
              <input
                type={showPassword ? "text" : "password"}
                className="w-full mt-1 p-2 pr-[0.75rem] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Nhập mật khẩu"
              />
              <button
                type="button"
                className="absolute text-[#D1D1D1] right-2 py-[0.875rem]"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="relative">
              <label className="block text-sm font-medium">Xác nhận mật khẩu</label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="w-full mt-1 p-2 pr-[0.75rem] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Xác nhận mật khẩu"
              />
              <button
                type="button"
                className="absolute text-[#D1D1D1] right-2 py-[0.875rem]"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="flex justify-between items-center gap-[0.5625rem]">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox" // Sửa lại thành checkbox như ý định ban đầu
                  className="h-4 w-4 accent-black border-black"
                />
                Duy trì đăng nhập
              </label>
              <a href="#" className="text-sm text-blue-500 hover:underline">
                Quên mật khẩu?
              </a>
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-black text-white font-medium rounded hover:bg-gray-800"
            >
              Đăng ký
            </button>
          </form>
          <p className="text-center text-sm">
            Đã có tài khoản?{" "}
            <button
              type="button"
              className="text-blue-500 hover:underline"
              onClick={() => {
                onClose(); // Đóng RegisterPopup
                onOpenLogin(); // Mở LoginPopup
              }}
            >
              Đăng nhập
            </button>
          </p>
          <p className="text-center text-sm text-[#707070]">
            Bằng cách đăng ký, bạn đồng ý với{" "}
            <a href="#" className="text-blue-500 hover:underline">
              Điều khoản sử dụng
            </a>{" "}
            và{" "}
            <a href="#" className="text-blue-500 hover:underline">
              Chính sách bảo mật
            </a>
            .
          </p>
        </div>
      </motion.div>
    </div>
  );
}