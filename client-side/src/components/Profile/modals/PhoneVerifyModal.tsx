"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { sendOtp, updateUser, verifyOtp } from "@/services/userApi";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

interface Props {
  onClose: () => void;
  onVerified?: (phone: string) => void;
  initialPhone?: string;
  userId: string; // Add userId prop
}

function isValidVietnamesePhone(phone: string) {
  return /^0\d{9,10}$/.test(phone);
}
export default function PhoneVerifyModal({
  onClose,
  onVerified,
  initialPhone,
  userId,
}: Props) {
  const { user } = useAuth(); // user phải có id
  const [phone, setPhone] = useState(initialPhone || "");
  const [accepted, setAccepted] = useState(false); // Mặc định không tích
  const [step, setStep] = useState<"input" | "otp">("input");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPhone(initialPhone || "");
  }, [initialPhone]);

  const isPhoneValid = isValidVietnamesePhone(phone);

  const handleSendCode = async () => {
    setError("");
    if (!phone) {
      setError("Vui lòng nhập số điện thoại.");
      return;
    }
    if (!isPhoneValid) {
      setError("Số điện thoại không hợp lệ.");
      return;
    }
    if (!accepted) {
      toast.error("Bạn cần đồng ý điều khoản trước khi gửi mã.");
      setError("Bạn cần đồng ý điều khoản.");
      return;
    }
    setLoading(true);
    try {
      await sendOtp(phone);
      setStep("otp");
    } catch (err: any) {
      setError(err.message || "Gửi OTP thất bại.");
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    setError("");
    if (!otp) return setError("Vui lòng nhập mã OTP.");
    setLoading(true);
    try {
      // 1. Xác minh OTP
      await verifyOtp(phone, otp);
      if (!user?.id) {
        setError("Không xác định được người dùng.");
        return;
      }
      // 2. Nếu thành công, gọi updateUserInfo để cập nhật số điện thoại
      await updateUser(user.id, { phone }); // use userId from props
      toast.success("Xác minh số điện thoại thành công!");
      // 3. Cập nhật state FE nếu cần
      onVerified?.(phone);
      onClose();
    } catch (err: any) {
      setError(err.message || "Xác minh OTP thất bại.");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-2">
      <div className="bg-white w-[536px] max-w-full rounded-lg shadow-lg p-[48px] mobile:p-3 mobile:pt-3 mobile:pb-3 relative max-h-[90vh] overflow-y-auto mobile:w-full">
        {/* Tiêu đề + Nút đóng */}
        <div className="flex relative items-center justify-between mb-[24px]">
          <h2 className="text-[24px] font-bold text-black leading-[36px]">
            Xác minh số điện thoại
          </h2>
          <button
            onClick={onClose}
            className="absolute top-1 right-1 w-[36px] h-[36px] rounded-full bg-[#F5F5F5] flex items-center justify-center z-10"
          >
            <Image src="/profile/Group.png" alt="Đóng" width={20} height={20} />
          </button>
        </div>
        {step === "input" && (
          <>
            <p className="text-gray-700 mb-4">
              Chúng tôi sẽ gửi cho bạn mã xác minh an toàn
            </p>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Số điện thoại"
              className="w-[440px] mobile:w-full h-[40px] border rounded-[8px] mb-2 px-3"
            />
            <span className="text-[12px] text-[#999999]">
              *Vui lòng nhập số điện thoại Việt Nam (bắt đầu bằng 0, đủ 10 số)
            </span>
            <div className="flex items-start mt-6 mb-6 gap-3">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="w-[20px] h-[20px] border border-black rounded-[4px]"
              />
              <p className="text-[16px] w-[408px] mobile:w-full text-[#1E1E1E]">
                Tôi đồng ý nhận một tin nhắn SMS để xác minh tài khoản của mình
                và chấp nhận Chính sách quyền riêng tư và Điều khoản sử dụng.
              </p>
            </div>
            {error && <p className="text-red-500 mb-2">{error}</p>}
            <button
              onClick={handleSendCode}
              className="bg-black text-white w-[440px] mobile:w-full h-[40px] rounded-[8px] hover:bg-gray-800"
              disabled={!accepted || !isPhoneValid || loading}
            >
              {loading ? "Đang gửi..." : "Gửi mã"}
            </button>
          </>
        )}
        {step === "otp" && (
          <>
            <p className="text-gray-700 mb-4">
              Nhập mã OTP đã gửi đến số <b>{phone}</b>
            </p>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Nhập mã OTP"
              className="w-[440px] mobile:w-full h-[40px] border rounded-[8px] mb-2 px-3"
              maxLength={6}
            />
            {error && <p className="text-red-500 mb-2">{error}</p>}
            <button
              onClick={handleVerifyOtp}
              className="bg-black text-white w-[440px] mobile:w-full h-[40px] rounded-[8px] hover:bg-gray-800"
              disabled={loading}
            >
              {loading ? "Đang xác minh..." : "Xác minh"}
            </button>
            <button
              onClick={() => setStep("input")}
              className="mt-2 text-blue-600 underline"
              disabled={loading}
            >
              Đổi số điện thoại
            </button>
          </>
        )}
      </div>
    </div>
  );
}
