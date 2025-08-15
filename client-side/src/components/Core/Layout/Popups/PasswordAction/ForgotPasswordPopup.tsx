"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import toast from "react-hot-toast";
import { forgotPassword } from "@/services/userApi";
import router from "next/router";

interface ForgotPasswordPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin?: () => void;
}

export default function ForgotPasswordPopup({
  isOpen,
  onClose,
  onOpenLogin,
}: ForgotPasswordPopupProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setEmail("");
      setError("");
    }
  }, [isOpen]);

  const validateEmail = (value: string) => {
    if (!value.trim()) return "Email không được để trống.";
    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value))
      return "Email không đúng định dạng.";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateEmail(email);
    if (err) {
      setError(err);
      return;
    }

    setLoading(true);
    try {
      const data = await forgotPassword(email);
      localStorage.setItem("resetEmail", email);
      toast.success(data.message || "Đã gửi email khôi phục.");
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Có lỗi xảy ra. Vui lòng thử lại.");
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
        className="relative w-[500px] bg-white rounded-[8px] p-10"
        initial={{ y: "-100vh" }}
        animate={{ y: 0 }}
        exit={{ y: "-100vh" }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        <button onClick={onClose} className="absolute top-4 right-4">
          <svg className="size-6" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="flex flex-col items-center gap-6">
          <Image
            src="https://res.cloudinary.com/testupload1/image/upload/v1755232178/logoDen_zjms3c.png"
            alt="Logo"
            width={50}
            height={50}
            draggable={false}
          />

          <h2 className="text-xl font-bold text-center">Quên mật khẩu</h2>
          <form onSubmit={handleSubmit} className="w-full space-y-5">
            <div>
              <label className="block font-semibold mb-1">Email</label>
              <input
                type="email"
                className="w-full border rounded px-4 py-2 text-sm"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setError(validateEmail(email))}
                disabled={loading}
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-black text-white rounded py-2 hover:bg-gray-800 disabled:bg-gray-500"
              disabled={loading}
            >
              {loading ? "Đang gửi..." : "Gửi yêu cầu khôi phục"}
            </button>
          </form>

          <p className="text-sm text-center">
            Quay lại{" "}
            <button
              className="text-black font-bold hover:underline"
              onClick={onOpenLogin}
            >
              đăng nhập
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
