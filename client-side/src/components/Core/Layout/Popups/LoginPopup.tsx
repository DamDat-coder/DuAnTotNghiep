"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../../../contexts/AuthContext";
import GoogleLoginButton from "@/components/Auth/GoogleLoginButton";

interface LoginPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRegister: () => void;
  initialFormData?: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  } | null;
}

export default function LoginPopup({
  isOpen,
  onClose,
  onOpenRegister,
  initialFormData,
}: LoginPopupProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    keepLoggedIn: false,
  });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  // Populate form from initialFormData
  useEffect(() => {
    if (initialFormData) {
      setFormData({
        email: initialFormData.email,
        password: initialFormData.password,
        keepLoggedIn: false,
      });
    }
  }, [initialFormData]);

  // Lock scroll when popup open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");

      // Reset form when popup closes
      if (!initialFormData) {
        setFormData({
          email: "",
          password: "",
          keepLoggedIn: false,
        });
        setErrors({});
      }
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isOpen, initialFormData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };

    if (name === "email") {
      if (!value.trim()) {
        newErrors.email = "Email không được để trống.";
      } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)) {
        newErrors.email = "Email không đúng định dạng.";
      } else {
        delete newErrors.email;
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

    setErrors(newErrors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Check for errors again before submit
    validateField("email", formData.email);
    validateField("password", formData.password);

    if (errors.email || errors.password) {
      setLoading(false);
      return;
    }

    try {
      const success = await login(
        formData.email,
        formData.password,
        formData.keepLoggedIn
      );
      if (success) {
        onClose();
        setFormData({
          email: "",
          password: "",
          keepLoggedIn: false,
        });
        setErrors({});
      }
    } catch (err: any) {
      setErrors((prev) => ({
        ...prev,
        password: err.message || "Có lỗi xảy ra khi đăng nhập.",
      }));
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
        className="relative w-[636px] h-auto bg-white rounded-[8px] scroll-hidden"
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

        <div className="flex flex-col items-center gap-10 py-[3.75rem] px-[7.5rem]">
          <Image
            src="/nav/logo.svg"
            alt="Logo"
            width={0}
            height={0}
            className="h-16 w-auto"
            draggable={false}
          />

          <div className="text-center">
            <h2 className="text-[24px] font-bold">Đăng nhập</h2>
            <p className="text-base w-[396px] text-[#707070]">
              Trở thành thành viên để có được những sản phẩm và giá tốt nhất.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="w-full flex flex-col items-center gap-10"
          >
            <div className="flex flex-col gap-3">
              <div className="w-[396px]">
                <label className="block text-sm font-bold">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={(e) => validateField("email", e.target.value)}
                  placeholder="Nhập email"
                  className="w-full h-[45px] border border-gray-300 rounded-[4px] px-4 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
                {errors.email && (
                  <span className="text-red-500 text-sm mt-1 block">
                    {errors.email}
                  </span>
                )}
              </div>

              <div className="relative w-[396px]">
                <label className="block text-sm font-bold">
                  Nhập mật khẩu <span className="text-red-500">*</span>
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={(e) => validateField("password", e.target.value)}
                  placeholder="Nhập mật khẩu"
                  autoComplete="new-password"
                  className="w-full h-[45px] border border-gray-300 rounded-[4px] px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-[2.375rem] right-3 text-gray-400"
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
                {errors.password && (
                  <span className="text-red-500 text-sm mt-1 block">
                    {errors.password}
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center w-[396px] text-sm">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
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
                  Duy trì đăng nhập
                </label>
                <a href="#" className="text-black hover:underline">
                  Quên mật khẩu?
                </a>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={loading}
                className="w-[396px] h-[49px] bg-black text-white rounded text-base hover:bg-gray-800"
              >
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>

              <p className="text-sm text-center">
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

              <GoogleLoginButton onLoginSuccess={onClose} />
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
