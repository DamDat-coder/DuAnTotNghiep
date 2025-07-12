"use client";

import ResetPasswordPopup from "@/components/Core/Layout/Popups/ResetPasswordPopup";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function ResetPasswordPage() {
  const params = useParams();
  const token = typeof params.token === "string" ? params.token : "";
  const [showPopup, setShowPopup] = useState(false);
  const [hasEmail, setHasEmail] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem("resetEmail");
    setHasEmail(!!email);
    setShowPopup(true);
  }, []);

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-50">
      {showPopup && hasEmail ? (
        <ResetPasswordPopup
          isOpen={showPopup}
          token={token}
          onClose={() => setShowPopup(false)}
        />
      ) : (
        <div className="text-center text-gray-500 animate-pulse">
          <p>Đang tải biểu mẫu đặt lại mật khẩu...</p>
        </div>
      )}
    </div>
  );
}
