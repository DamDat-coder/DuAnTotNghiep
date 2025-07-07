// src/components/Core/Layout/Header/UserDropdown.tsx
"use client";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveTab } from "@/contexts/ActiveTabContext";

export default function UserDropdown() {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { setActiveTab } = useActiveTab();
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
  const handleOrderClick = () => {
    setActiveTab("Đơn hàng"); // Update active tab to "Yêu thích"
    window.history.pushState({}, "", "/profile?tab=order"); // Update URL
  };
  return (
    <div
      ref={dropdownRef}
      className="relative hidden tablet:hidden laptop:block desktop:block"
      onMouseEnter={() => setIsDropdownOpen(true)}
      onMouseLeave={() => setIsDropdownOpen(false)}
    >
      <div className="flex items-center space-x-2 cursor-pointer ">
        <span className="text-gray-700 text-base font-description w-16 text-center overflow-hidden text-ellipsis whitespace-nowrap">
          Hi, {user.name?.split(" ").pop()}
        </span>

        <Image
          src="/nav/nav_user.svg"
          alt="Logo"
          width={120}
          height={40}
          className="h-6 w-6 rounded-full"
        />
      </div>

      {/* Dropdown */}
      <div
        className={`absolute right-0 top-full w-[13rem] bg-white rounded-lg shadow-lg z-50 transition-all duration-300 ease-out transform ${
          isDropdownOpen
            ? "opacity-100 translate-y-0 visible"
            : "opacity-0 -translate-y-2 invisible pointer-events-none"
        }`}
      >
        <div className="flex flex-col py-3 px-4 gap-2">
          <Link
            href="/profile"
            className="block px-4 py-2 text-[0.875rem] font-medium text-gray-700 hover:bg-gray-100 rounded-t-lg"
          >
            Thông tin người dùng
          </Link>
          <Link
            href="#"
            onClick={handleOrderClick}
            className="block px-4 py-2 text-[0.875rem] font-medium text-gray-700 hover:bg-gray-100"
          >
            Đơn hàng
          </Link>
          <button
            type="button"
            className="block w-full text-[0.875rem] font-medium text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
            onClick={() => {
              setIsDropdownOpen(false);
            }}
          >
            Đổi mật khẩu
          </button>
          <button
            type="button"
            className="block w-full text-[0.875rem] font-medium text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-b-lg"
            onClick={() => {
              logout();
              setIsDropdownOpen(false);
            }}
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
}
