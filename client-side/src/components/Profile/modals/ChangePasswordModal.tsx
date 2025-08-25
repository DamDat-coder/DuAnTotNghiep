"use client";
import React, { useState } from "react";
import ReactDOM from "react-dom";
import Image from "next/image";
import { ResetPasswordData, ResetPasswordResponse } from "@/types/auth";
import { updatePassword } from "@/services/userApi";
import { toast } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

interface Props {
  onClose: () => void;
}

export default function ChangePasswordModal({ onClose }: Props) {
  const [formData, setFormData] = useState<ResetPasswordData>({
    oldPassword: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate inputs
    if (
      !formData.oldPassword ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      toast.error("Vui lòng nhập đầy đủ thông tin.");
      setLoading(false);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp.");
      setLoading(false);
      return;
    }
    if (formData.password.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự.");
      setLoading(false);
      return;
    }

    try {
      const res: ResetPasswordResponse = await updatePassword({
        oldPassword: formData.oldPassword,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      if (res.success) {
        toast.success("Đổi mật khẩu thành công!");
        onClose();
      } else {
        toast.error(res.message || "Đổi mật khẩu thất bại.");
      }
    } catch (error: any) {
      if (error.message === "Mật khẩu hiện tại không chính xác.") {
        toast.error("Mật khẩu cũ sai.");
      } else if (
        error.message === "Không có token. Vui lòng đăng nhập lại." ||
        error.message === "Unable to refresh token"
      ) {
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      } else {
        toast.error(error.message || "Đã xảy ra lỗi khi đổi mật khẩu.");
      }
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-2">
      <div className="bg-white w-[536px] max-w-full mobile:w-full h-auto rounded-lg shadow-lg px-[48px] pt-[36px] pb-[24px] mobile:p-3 relative max-h-[90vh] overflow-y-auto">
        {/* Tiêu đề + Nút đóng */}
        <div className="flex items-center justify-between mb-[24px]">
          <h2 className="text-[24px] font-bold text-black leading-[36px]">
            Đổi mật khẩu
          </h2>
          <button
            onClick={onClose}
            className="w-[36px] h-[36px] rounded-full bg-[#F5F5F5] flex items-center justify-center text-[20px] font-bold"
            aria-label="Đóng"
          >
            <Image
              src="/profile/close.svg"
              width={20}
              height={20}
              alt="close"
            />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} id="change-password-form" noValidate>
          <div className="w-[440px] mobile:w-full relative mb-[20px]">
            <input
              type={showOldPassword ? "text" : "password"}
              name="oldPassword"
              value={formData.oldPassword}
              onChange={handleInputChange}
              autoComplete="new-password"
              placeholder="Nhập mật khẩu cũ"
              className="w-full h-[45px] border border-[#E5E7EB] rounded-[8px] px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              data-autocomplete="new-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowOldPassword(!showOldPassword)}
              className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400"
            >
              {showOldPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
          <div className="w-[440px] mobile:w-full relative mb-[20px]">
            <input
              type={showPassword ? "text" : "password"}
              name="newPassword"
              value={formData.password}
              onChange={(e) =>
                handleInputChange({
                  ...e,
                  target: {
                    ...e.target,
                    name: "password",
                    value: e.target.value,
                  },
                })
              }
              autoComplete="new-password"
              placeholder="Nhập mật khẩu mới"
              className="w-full h-[45px] border border-[#E5E7EB] rounded-[8px] px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              data-autocomplete="new-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400"
            >
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
          <div className="w-[440px] mobile:w-full relative mb-[20px]">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              autoComplete="new-password"
              placeholder="Xác nhận mật khẩu mới"
              className="w-full h-[45px] border border-[#E5E7EB] rounded-[8px] px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              data-autocomplete="new-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400"
            >
              {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-[440px] mobile:w-full h-[40px] rounded-[8px] text-sm ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-black text-[#F5F5F5] hover:bg-opacity-90"
            }`}
          >
            {loading ? "Đang xử lý..." : "Lưu thay đổi"}
          </button>
        </form>
      </div>
    </div>
  );

  if (typeof window === "undefined") return null;
  return ReactDOM.createPortal(modalContent, document.body);
}
