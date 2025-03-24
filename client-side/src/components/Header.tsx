"use client";

import { useState } from "react";
import Image from "next/image";
import MobileMenu from "./MobileMenu";
import LookupMenu from "./LookupMenu";
import LoginPopup from "./LoginPopup";
import RegisterPopup from "./RegisterPopup";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLookupOpen, setIsLookupOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

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
            <a href="/" className="px-3 py-2 text-xl font-medium hover:bg-gray-200 rounded">
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
                <img src="/nav/nav_like_desktop.svg" alt="Wishlist" className="h-5 w-auto" />
              </a>
              <a href="#" className="text-gray-400 hover:text-black">
                <img src="/nav/nav_cart.svg" alt="Cart" className="h-6 w-auto" />
              </a>
              <button
                type="button"
                className="text-gray-400 hover:text-black focus:ring-2 focus:ring-gray-300 focus:outline-none"
                onClick={() => setIsLoginOpen(true)}
              >
                <img src="/nav/nav_user.svg" alt="User" className="h-6 w-auto" />
              </button>
            </div>

            {/* Render các component mà không cần điều kiện */}
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