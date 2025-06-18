"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../../../contexts/AuthContext";

interface RegisterPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
}

export default function RegisterPopup({
  isOpen,
  onClose,
  onOpenLogin,
}: RegisterPopupProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    keepLoggedIn: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", isOpen);
    return () => document.body.classList.remove("overflow-hidden");
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "radio" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu và nhập lại mật khẩu không khớp.");
      setLoading(false);
      return;
    }

    try {
      const success = await register(
        formData.name,
        formData.email,
        formData.password,
        formData.keepLoggedIn
      );
      if (success) {
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          keepLoggedIn: false,
        });
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra khi đăng ký.");
    } finally {
      setLoading(false);
    }
  };

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
      {/* Overlay */}
      <motion.div
        className="absolute inset-0 bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        className="relative w-[636px] h-[90%] overflow-y-scroll bg-white rounded-lg scroll-hidden"
        initial={{ y: "-100vh" }}
        animate={{ y: 0 }}
        exit={{ y: "-100vh" }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-black cursor-pointer"
        >
          <svg className="size-6" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Logo + heading */}
        <div className="flex flex-col items-center mt-[60px] mb-[60px] gap-0 px-[7.5rem]">
          <Image
            src="/nav/logo.svg"
            alt="Logo"
            width={0}
            height={0}
            className="h-8 w-auto mb-[40px]"
            draggable={false}
          />
          <div className="text-center mb-[40px]">
            <h2 className="text-[24px] font-bold mb-1">Đăng ký</h2>
            <p className="text-base w-[396px] text-[#707070]">
              Trở thành thành viên để có được những sản phẩm và giá tốt nhất.
            </p>
          </div>
          {error && (
            <p className="text-sm text-center text-red-500 mb-4">{error}</p>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col items-center">
            {/* Họ và tên */}
            <div className="w-[396px] mb-3">
              <label className="block text-sm font-bold mb-1">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Nhập họ và tên"
                className="w-full h-[45px] border border-gray-300 rounded px-4 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {/* Email */}
            <div className="w-[396px] mb-3">
              <label className="block text-sm font-bold mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Nhập Email"
                className="w-full h-[45px] border border-gray-300 rounded px-4 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {/* Mật khẩu */}
            <div className="w-[396px] mb-3 relative">
              <label className="block text-sm font-bold mb-1">
                Nhập mật khẩu <span className="text-red-500">*</span>
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
                placeholder="Nhập mật khẩu"
                className="w-full h-[45px] border border-gray-300 rounded px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-[36px] right-3 text-gray-400"
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>

            {/* Nhập lại mật khẩu */}
            <div className="w-[396px] mb-3 relative">
              <label className="block text-sm font-bold mb-1">
                Nhập lại mật khẩu <span className="text-red-500">*</span>
              </label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
                placeholder="Nhập lại mật khẩu"
                className="w-full h-[45px] border border-gray-300 rounded px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute top-[36px] right-3 text-gray-400"
              >
                {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>

            {/* Radio: Duy trì đăng nhập */}
            <div className="w-[396px] mb-[40px]">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="keepLoggedIn"
                  checked={formData.keepLoggedIn}
                  onChange={() => {}} // để không warning
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      keepLoggedIn: !prev.keepLoggedIn,
                    }))
                  }
                  className="w-4 h-4 rounded-full text-black border-gray-400 accent-black"
                />
                Duy trì đăng nhập
              </label>
            </div>

            {/* Đăng ký button */}
            <button
              type="submit"
              disabled={loading}
              className="w-[396px] h-[49px] bg-black text-white text-base rounded font-medium hover:bg-gray-800 mb-[12px]"
            >
              {loading ? "Đang đăng ký..." : "Đăng ký"}
            </button>

            {/* Đã có tài khoản? */}
            <p className="text-sm mb-[12px]">
              Đã có tài khoản?{" "}
              <button
                type="button"
                className="text-black font-bold hover:underline"
                onClick={() => {
                  onClose();
                  onOpenLogin();
                }}
              >
                Đăng nhập
              </button>
            </p>

            {/* Đăng ký bằng Google */}
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
