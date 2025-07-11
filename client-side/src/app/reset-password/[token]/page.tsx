// app/reset-password/[token]/page.tsx
"use client";

import ResetPasswordPopup from "@/components/Core/Layout/Popups/ResetPasswordPopup";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function ResetPasswordPage() {
  const params = useParams();
  const token = typeof params.token === "string" ? params.token : "";

  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (token) setShowPopup(true);
  }, [token]);

  return (
    <>
      <ResetPasswordPopup
        isOpen={showPopup}
        token={token}
        onClose={() => setShowPopup(false)}
      />
    </>
  );
}
