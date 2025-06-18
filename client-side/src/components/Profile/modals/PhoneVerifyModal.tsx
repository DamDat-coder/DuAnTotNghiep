"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
interface Props {
  onClose: () => void;
  onVerified?: (phone: string) => void;
  initialPhone?: string;
}

export default function PhoneVerifyModal({
  onClose,
  onVerified,
  initialPhone,
}: Props) {
  const [phone, setPhone] = useState(initialPhone || "");
  const [accepted, setAccepted] = useState(true);

  useEffect(() => {
    setPhone(initialPhone || "");
  }, [initialPhone]);

  const handleSendCode = () => {
    if (!phone || !accepted) return;

    // Giả lập gửi mã xác minh
    console.log("📲 Đã gửi mã xác minh đến:", phone);
    onVerified?.(phone);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white w-[536px] rounded-lg shadow-lg p-[48px] relative">
        {/* Tiêu đề + Nút đóng */}
        <div className="flex relative items-center justify-between mb-[24px]">
          <h2 className="text-[24px] font-bold text-black leading-[36px]">
            Xác minh số điện thoại di động của bạn.
          </h2>
          <button
            onClick={onClose}
            className="absolute top-1 right-1 w-[36px] h-[36px] rounded-full bg-[#F5F5F5] flex items-center justify-center z-10"
          >
            <Image src="/profile/Group.png" alt="Đóng" width={20} height={20} />
          </button>
        </div>
        <p className="text-gray-700 mb-4">
          Chúng tôi sẽ gửi cho bạn mã xác minh an toàn
        </p>

        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Số điện thoại"
          className="w-[440px] h-[40px] border rounded-[8px] mb-4 px-3"
        />
        <span className="text-[12px] text-[#999999]">
          *Vui lòng nhập số điện thoại
        </span>

        <div className="flex items-start mt-6 mb-6 gap-3">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="w-[20px] h-[20px] appearance-none border border-black rounded-[4px]
             bg-white checked:bg-black checked:after:content-['✓'] checked:after:text-white
             checked:after:flex checked:after:items-center checked:after:justify-center
             flex items-center justify-center"
          />

          <p className="text-[16px] w-[408px] text-[#1E1E1E]">
            Tôi đồng ý nhận một tin nhắn SMS để xác minh tài khoản của mình và
            chấp nhận Chính sách quyền riêng tư và Điều khoản sử dụng.
          </p>
        </div>

        <p className="text-[16px] text-[#757575] mb-6">
          Có thể áp dụng phí tin nhắn và dữ liệu. Việc xác minh có thể bị chậm
          trễ nếu có sự cố với nhà mạng của bạn.
        </p>

        <button
          onClick={handleSendCode}
          className="bg-black text-white w-[440px] h-[40px] rounded-[8px] hover:bg-gray-800"
        >
          Gửi mã
        </button>
      </div>
    </div>
  );
}
