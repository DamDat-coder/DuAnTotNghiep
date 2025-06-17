"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../../../contexts/AuthContext";

interface LoginPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRegister: () => void;
}

export default function LoginPopup({
  isOpen,
  onClose,
  onOpenRegister,
}: LoginPopupProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
    keepLoggedIn: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", isOpen);
    return () => document.body.classList.remove("overflow-hidden");
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const success = await login(
        formData.identifier,
        formData.password,
        formData.keepLoggedIn
      );
      if (success) onClose();
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra khi đăng nhập.");
    } finally {
      setLoading(false);
    }
  };

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
        className="relative w-[636px] bg-white rounded-[8px] p-6"
        initial={{ y: "-100vh" }}
        animate={{ y: 0 }}
        exit={{ y: "-100vh" }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-black hover:text-gray-700"
        >
          <svg className="size-6" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="flex flex-col items-center mt-[60px] mb-[60px] gap-0">
          {/* Logo */}
          <Image
            src="/nav/logo.svg"
            alt="Logo"
            width={0}
            height={0}
            className="h-8 w-auto mb-[40px]"
            draggable={false}
          />

          {/* Tiêu đề */}
          <div className="text-center mb-[40px]">
            <h2 className="text-[24px] font-bold mb-1">Đăng nhập</h2>
            <p className="text-base w-[396px] text-[#707070]">
              Trở thành thành viên để có được những sản phẩm và giá tốt nhất.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="w-full flex flex-col items-center"
          >
            <div className="mb-[12px] w-[396px]">
              <label className="block text-sm font-bold mb-1">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="identifier"
                value={formData.identifier}
                onChange={handleChange}
                placeholder="Nhập số điện thoại"
                required
                className="w-full h-[45px] border border-gray-300 rounded-[4px] px-4 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div className="relative mb-[12px] w-[396px]">
              <label className="block text-sm font-bold mb-1">
                Nhập mật khẩu <span className="text-red-500">*</span>
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Nhập mật khẩu"
                required
                className="w-full h-[45px] border border-gray-300 rounded-[4px] px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-[34px] right-3 text-gray-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="flex justify-between items-center w-[396px] mb-[40px] text-sm">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  name="keepLoggedIn"
                  checked={formData.keepLoggedIn}
                  onChange={handleChange}
                  className="appearance-none w-4 h-4 rounded-full border border-gray-400 checked:bg-black checked:border-black focus:outline-none"
                />
                Duy trì đăng nhập
              </label>
              <a href="#" className="text-black hover:underline">
                Quên mật khẩu?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-[396px] h-[49px] bg-black text-white rounded text-base mb-[12px] hover:bg-gray-800"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>

            <p className="text-sm text-center mb-[12px]">
              Chưa có tài khoản?{" "}
              <button
                className="text-black font-bold hover:underline"
                onClick={() => {
                  onClose();
                  onOpenRegister();
                }}
              >
                Đăng ký
              </button>
            </p>

            <button className="w-[396px] h-[49px] border border-[#000000] py-2 flex items-center justify-center gap-2 rounded text-sm hover:bg-gray-100">
              <Image
                src="/user/google.svg"
                alt="Google"
                width={20}
                height={20}
              />
              <span className="font-medium">Sign in with Google</span>
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
