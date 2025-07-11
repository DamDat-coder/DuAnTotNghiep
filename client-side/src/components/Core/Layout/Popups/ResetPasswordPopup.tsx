"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";
import { resetPassword } from "@/services/userApi";
import { useRouter } from "next/navigation";
interface ResetPasswordPopupProps {
  isOpen: boolean;
  token: string;
  onClose: () => void;
}
import { useAuth } from "@/contexts/AuthContext";

export default function ResetPasswordPopup({
  isOpen,
  token,
  onClose,
}: ResetPasswordPopupProps) {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});
  const router = useRouter();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const { setOpenLoginWithData, setRegisterFormData } = useAuth();
  const validate = () => {
    const errs: typeof errors = {};
    if (!formData.password || formData.password.length < 6) {
      errs.password = "Mật khẩu phải có ít nhất 6 ký tự.";
    }
    if (formData.confirmPassword !== formData.password) {
      errs.confirmPassword = "Mật khẩu xác nhận không khớp.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      await resetPassword(token, formData.password); // gọi API BE
      toast.success("Đặt lại mật khẩu thành công!");
      onClose();
      router.push("/");
    } catch (err: any) {
      toast.error(err.message || "Đặt lại mật khẩu thất bại.");
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
        className="relative w-[500px] bg-white rounded-lg p-8 z-10"
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

        <div className="text-center mb-6">
          <Image
            src="/nav/logo.svg"
            alt="Logo"
            width={0}
            height={0}
            className="h-12 w-auto mx-auto"
          />
          <h2 className="text-xl font-bold mt-2">Đặt lại mật khẩu</h2>
          <p className="text-gray-600 text-sm">
            Vui lòng nhập mật khẩu mới của bạn.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">
              Mật khẩu mới
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">
              Xác nhận mật khẩu
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white py-2 rounded hover:bg-gray-800"
          >
            {loading ? "Đang xử lý..." : "Xác nhận"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
