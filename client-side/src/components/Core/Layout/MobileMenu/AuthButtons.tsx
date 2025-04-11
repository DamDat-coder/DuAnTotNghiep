// src/components/Core/Layout/MobileMenu/AuthButtons.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface AuthButtonsProps {
  onClose: () => void;
  setIsLoginOpen: (isOpen: boolean) => void;
  setIsRegisterOpen: (isOpen: boolean) => void;
}

export default function AuthButtons({
  onClose,
  setIsLoginOpen,
  setIsRegisterOpen,
}: AuthButtonsProps) {
  const { user, logout } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="flex justify-center gap-2">
      {isClient ? (
        user ? (
          <button
            className="p-3 rounded-full border border-black"
            onClick={() => {
              logout();
              onClose();
            }}
          >
            Đăng xuất
          </button>
        ) : (
          <>
            <button
              className="bg-black text-white p-3 rounded-full"
              onClick={() => {
                setIsRegisterOpen(true);
                onClose();
              }}
            >
              Đăng ký
            </button>
            <button
              className="p-3 rounded-full border border-black"
              onClick={() => {
                setIsLoginOpen(true);
                onClose();
              }}
            >
              Đăng nhập
            </button>
          </>
        )
      ) : (
        <>
          <button
            className="bg-black text-white p-3 rounded-full opacity-50"
            disabled
          >
            Đăng ký
          </button>
          <button
            className="p-3 rounded-full border border-black opacity-50"
            disabled
          >
            Đăng nhập
          </button>
        </>
      )}
    </div>
  );
}