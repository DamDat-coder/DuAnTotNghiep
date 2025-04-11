// src/components/Core/Layout/Header/UserDropdown.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function UserDropdown() {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi nhấn ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div
      ref={dropdownRef}
      className="relative"
      onClick={() => setIsDropdownOpen((prev) => !prev)}
    >
      <div className="flex items-center space-x-2 cursor-pointer">
        <span className="text-gray-700">Hi, {user.name}</span>
        <img
          src="/nav/avatar.png"
          alt="User"
          className="h-[2.375rem] w-auto rounded-full"
        />
      </div>
      {isDropdownOpen && (
        <div className="absolute right-0 top-full w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <Link
            href="/profile"
            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-t-lg"
          >
            Thông tin người dùng
          </Link>
          <hr />
          <button
            type="button"
            className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
            onClick={() => {
              logout();
              setIsDropdownOpen(false);
            }}
          >
            Quên mật khẩu
          </button>
          <hr />
          <button
            type="button"
            className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-b-lg"
            onClick={() => {
              logout();
              setIsDropdownOpen(false);
            }}
          >
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}