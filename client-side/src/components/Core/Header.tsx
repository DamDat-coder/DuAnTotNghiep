// src/components/Header.tsx
"use client";

import { useState, useEffect } from "react"; // Thêm useEffect
import Image from "next/image";
import MobileMenu from "./MobileMenu";
import LookupMenu from "./LookupMenu";
import LoginPopup from "./LoginPopup";
import RegisterPopup from "./RegisterPopup";
import { useMenu } from "@/contexts/MenuContext";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const { isOpen: isMenuOpen, setIsOpen: setIsMenuOpen } = useMenu();
  const { user, logout } = useAuth();
  const [isLookupOpen, setIsLookupOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isClient, setIsClient] = useState(false); // Thêm trạng thái isClient

  // Đặt isClient thành true sau khi client mounted
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <nav className="bg-white text-black">
      <div className="w-[95%] mx-auto px-4 max-w-[2560px] desktop:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Image
              src="/nav/logo.svg"
              alt="Logo"
              width={120}
              height={40}
              className="h-auto w-auto"
              draggable={false}
              loading="lazy"
            />
          </div>

          <div className="hidden desktop:flex items-center space-x-6">
            <a href="/" className="px-3 py-2 text-xl font-bold hover:bg-gray-200 rounded">
              Trang chủ
            </a>
            <a href="/products" className="px-3 py-2 text-xl font-medium hover:bg-gray-200 rounded">
              Nam
            </a>
            <a href="" className="px-3 py-2 text-xl font-medium hover:bg-gray-200 rounded">
              Nữ
            </a>
            <a href="" className="px-3 py-2 text-xl font-medium hover:bg-gray-200 rounded">
              Giảm giá
            </a>
            <a href="" className="px-3 py-2 text-xl font-medium hover:bg-gray-200 rounded">
              Bài viết
            </a>
          </div>

          <div className="flex items-center space-x-[0.75rem]">
            <div className="flex items-center space-x-[0.75rem] desktop:hidden">
              <button
                type="button"
                className="text-gray-400 hover:text-black focus:ring-2 focus:ring-gray-300 focus:outline-none"
                onClick={() => setIsLookupOpen(!isLookupOpen)}
              >
                <img src="/nav/nav_lookup.svg" alt="Lookup" className="h-6 w-auto" />
              </button>
              <button
                type="button"
                className="text-gray-400 hover:text-black focus:ring-2 focus:ring-gray-300 focus:outline-none"
                onClick={() => setIsLoginOpen(true)}
              >
                <img src="/nav/nav_user.svg" alt="Nav User" className="h-6 w-auto" />
              </button>
              <a href="/cart">
                <img src="/nav/nav_cart.svg" alt="Nav Cart" className="h-6 w-auto" />
              </a>
              <button
                type="button"
                className="text-gray-400 hover:text-black focus:ring-2 focus:ring-gray-300 focus:outline-none"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <img src="/nav/nav_bugger.svg" alt="Menu" />
              </button>
            </div>

            <div className="hidden desktop:flex items-center space-x-[0.75rem]">
              <button
                type="button"
                className="text-gray-400 hover:text-black focus:ring-2 focus:ring-gray-300 focus:outline-none"
                onClick={() => setIsLookupOpen(!isLookupOpen)}
              >
                <img src="/nav/nav_lookup.svg" alt="Lookup" className="h-6 w-auto" />
              </button>
              <a href="#" className="text-gray-400 hover:text-black">
                <img src="/nav/nav_like_desktop.svg" alt="Wishlist" className="h-[1.05rem] w-auto" />
              </a>
              <a href="/cart" className="text-gray-400 hover:text-black">
                <img src="/nav/nav_cart.svg" alt="Cart" className="h-6 w-auto" />
              </a>
              {isClient ? ( // Chỉ render phần này khi client đã mounted
                user ? (
                  <div
                    className="relative"
                    onMouseEnter={() => setIsDropdownOpen(true)}
                    onMouseLeave={() => setIsDropdownOpen(false)}
                  >
                    <div className="flex items-center space-x-2 cursor-pointer">
                    <span className="text-gray-700">
                        Hi, {user.name}
                      </span>
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
                          className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-b-lg"
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
                ) : (
                  <button
                    type="button"
                    className="text-gray-400 hover:text-black focus:ring-2 focus:ring-gray-300 focus:outline-none"
                    onClick={() => setIsLoginOpen(true)}
                  >
                    <img src="/nav/nav_user.svg" alt="User" className="h-6 w-auto" />
                  </button>
                )
              ) : (
                // Placeholder khi chưa mounted
                <div className="w-12 h-12"></div>
              )}
            </div>

            <MobileMenu isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} />
            <LookupMenu isOpen={isLookupOpen} setIsOpen={setIsLookupOpen} />
            <LoginPopup
              isOpen={isLoginOpen}
              onClose={() => setIsLoginOpen(false)}
              onOpenRegister={() => setIsRegisterOpen(true)}
            />
            <RegisterPopup
              isOpen={isRegisterOpen}
              onClose={() => setIsRegisterOpen(false)}
              onOpenLogin={() => setIsLoginOpen(true)}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}