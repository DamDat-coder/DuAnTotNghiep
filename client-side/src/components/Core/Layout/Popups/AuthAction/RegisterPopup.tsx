"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../../../../contexts/AuthContext";
import GoogleLoginButton from "@/components/Auth/GoogleLoginButton";
import toast from "react-hot-toast";

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

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

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

  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };

    if (name === "name") {
      newErrors.name = value.trim()
        ? undefined
        : "Họ và tên không được để trống.";
    }

    if (name === "email") {
      if (!value.trim()) {
        newErrors.email = "Email không được để trống.";
      } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)) {
        newErrors.email = "Email không đúng định dạng.";
      } else {
        newErrors.email = undefined;
      }
    }

    if (name === "password") {
      if (!value.trim()) {
        newErrors.password = "Mật khẩu không được để trống.";
      } else if (value.length < 6) {
        newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
      } else {
        newErrors.password = undefined;
      }
    }

    if (name === "confirmPassword") {
      if (!value.trim()) {
        newErrors.confirmPassword = "Vui lòng nhập lại mật khẩu.";
      } else if (value !== formData.password) {
        newErrors.confirmPassword = "Mật khẩu không khớp.";
      } else {
        newErrors.confirmPassword = undefined;
      }
    }

    setErrors(newErrors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate toàn bộ trước khi submit
    validateField("name", formData.name);
    validateField("email", formData.email);
    validateField("password", formData.password);
    validateField("confirmPassword", formData.confirmPassword);

    const hasErrors = Object.values(errors).some((error) => error);
    if (hasErrors) {
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
        setErrors({});
        onClose();
      }
    } catch (err: any) {
      toast.error(err.message || "Có lỗi xảy ra khi đăng ký.");
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
        className="relative w-[636px] h-[90%] overflow-y-scroll bg-white rounded-lg scroll-hidden"
        initial={{ y: "-100vh" }}
        animate={{ y: 0 }}
        exit={{ y: "-100vh" }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
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

        <div
          className="flex flex-col h-[90%] items-center 
           px-[2.5rem] py-4 gap-5
           laptop:py-[2rem] laptop:px-[5rem] laptop:gap-8
           desktop:py-[3rem] desktop:px-[7.5rem] desktop:gap-10"
        >
          {" "}
          <Image
            src="/nav/logo.svg"
            alt="Logo"
            width={0}
            height={0}
            className="h-16 w-auto"
            draggable={false}
          />
          <div className="text-center">
            <h2 className="text-[24px] font-bold">Đăng ký</h2>
            <p className="text-base w-[396px] text-[#707070]">
              Trở thành thành viên để có được những sản phẩm và giá tốt nhất.
            </p>
          </div>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center gap-10"
          >
            <div className="flex flex-col gap-3">
              {/* Họ và tên */}
              <div className="w-[396px]">
                <label className="block text-sm font-bold">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={(e) => validateField("name", e.target.value)}
                  placeholder="Nhập họ và tên"
                  className="w-full h-[45px] border border-gray-300 rounded px-4 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
                {errors.name && (
                  <span className="text-red-500 text-sm">{errors.name}</span>
                )}
              </div>

              {/* Email */}
              <div className="w-[396px]">
                <label className="block text-sm font-bold">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={(e) => validateField("email", e.target.value)}
                  placeholder="Nhập Email"
                  className="w-full h-[45px] border border-gray-300 rounded px-4 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
                {errors.email && (
                  <span className="text-red-500 text-sm">{errors.email}</span>
                )}
              </div>

              {/* Mật khẩu */}
              <div className="w-[396px] relative">
                <label className="block text-sm font-bold">
                  Nhập mật khẩu <span className="text-red-500">*</span>
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={(e) => validateField("password", e.target.value)}
                  autoComplete="new-password"
                  placeholder="Nhập mật khẩu"
                  className="w-full h-[45px] border border-gray-300 rounded px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-[50%] right-3 text-gray-400"
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
                {errors.password && (
                  <span className="text-red-500 text-sm block">
                    {errors.password}
                  </span>
                )}
              </div>

              {/* Nhập lại mật khẩu */}
              <div className="w-[396px] relative">
                <label className="block text-sm font-bold">
                  Nhập lại mật khẩu <span className="text-red-500">*</span>
                </label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={(e) =>
                    validateField("confirmPassword", e.target.value)
                  }
                  autoComplete="new-password"
                  placeholder="Nhập lại mật khẩu"
                  className="w-full h-[45px] border border-gray-300 rounded px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute top-[50%] right-3 text-gray-400"
                >
                  {showConfirmPassword ? (
                    <Eye size={18} />
                  ) : (
                    <EyeOff size={18} />
                  )}
                </button>
                {errors.confirmPassword && (
                  <span className="text-red-500 text-sm block">
                    {errors.confirmPassword}
                  </span>
                )}
              </div>

              {/* Tự động đăng nhập sau khi đăng ký */}
              <div className="w-[396px]">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="keepLoggedIn"
                    checked={formData.keepLoggedIn}
                    onChange={() => {}}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        keepLoggedIn: !prev.keepLoggedIn,
                      }))
                    }
                    className="w-4 h-4 rounded-full text-black border-gray-400 accent-black"
                  />
                  Tự động đăng nhập sau khi đăng ký
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-[396px] h-[49px] bg-black text-white text-base rounded font-medium hover:bg-gray-800"
              >
                {loading ? "Đang đăng ký..." : "Đăng ký"}
              </button>

              <p className="text-sm text-center">
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
              <div className="w-full flex justify-center items-center gap-2">
                <hr className="flex-1 border-solid border border-gray-300" />
                <p className="text-gray-500">Hoặc</p>

                <hr className="flex-1 border-solid border border-gray-300" />
              </div>
              <GoogleLoginButton onLoginSuccess={onClose} />
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
