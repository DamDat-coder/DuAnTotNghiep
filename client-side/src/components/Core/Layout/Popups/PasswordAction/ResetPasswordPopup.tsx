"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";
import { login, resetPassword } from "@/services/userApi";
import { useAuth } from "@/contexts/AuthContext";

type ResetPasswordPopupProps = {
  isOpen: boolean;
  token: string;
  onClose: () => void;
};

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
  const [loginNow, setLoginNow] = useState(true);
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});
  const { setOpenLoginWithData, setRegisterFormData } = useAuth();
  const [storedEmail, setStoredEmail] = useState<string | null>(null);
  const validateField = (name: string, value: string) => {
    const newErrors: typeof errors = { ...errors };

    if (name === "password") {
      if (!value || value.length < 6) {
        newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
      } else {
        delete newErrors.password;
      }
    }

    if (name === "confirmPassword") {
      if (value !== formData.password) {
        newErrors.confirmPassword = "Mật khẩu xác nhận không khớp.";
      } else {
        delete newErrors.confirmPassword;
      }
    }

    setErrors(newErrors);
  };

  useEffect(() => {
    const email = localStorage.getItem("resetEmail");
    setStoredEmail(email);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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
    if (!validate() || !storedEmail) return;

    try {
      setLoading(true);
      const result = await resetPassword(token, formData.password);
      toast.success(result.message || "Đặt lại mật khẩu thành công!");

      if (loginNow) {
        try {
          const loginSuccess = await login(storedEmail, formData.password);
          if (loginSuccess) {
            toast.success("Đăng nhập thành công với mật khẩu mới!");
             window.location.href = "/";
          }
        } catch {
          toast.error("Đặt lại mật khẩu thành công, nhưng đăng nhập thất bại.");
        }
      } else {
        onClose();
        setRegisterFormData({
          email: storedEmail,
          password: formData.password,
          confirmPassword: formData.password,
          name: "",
        });
        setOpenLoginWithData(true);
      }
    } catch (err: any) {
      toast.error(err.message || "Đặt lại mật khẩu thất bại.");
    } finally {
      localStorage.removeItem("resetEmail");
      setLoading(false);
    }
  };

  if (!isOpen || !storedEmail) return null;

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
                autoComplete="off"
                onBlur={(e) => validateField(e.target.name, e.target.value)}
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
              onBlur={(e) => validateField(e.target.name, e.target.value)}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">{errors.confirmPassword}</p>
            )}
          </div>

          <div className="flex items-center gap-2 mt-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                name="loginNow"
                checked={loginNow}
                onChange={() => setLoginNow(!loginNow)}
                className="w-4 h-4 rounded-full text-black border-gray-400 accent-black"
              />
              Đăng nhập ngay với mật khẩu mới
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white py-2 rounded hover:bg-gray-800 mt-2"
          >
            {loading ? "Đang xử lý..." : "Xác nhận"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
