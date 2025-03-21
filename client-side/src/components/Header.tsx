// src/components/Header.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import MobileMenu from "./MobileMenu";
import LookupMenu from "./LookupMenu";
import LoginPopup from "./LoginPopup";
import RegisterPopup from "./RegisterPopup"; // Thêm RegisterPopup

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLookupOpen, setIsLookupOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false); // Thêm state cho RegisterPopup

  return (
    <nav className="bg-white text-black">
      <div className="container mx-auto px-4">
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
          <div className="cta">
            <div className="flex items-center space-x-[0.75rem] tablet:hidden">
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
              <a href="#">
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
            <div className="hidden tablet:flex space-x-4">
              <a href="#" className="px-3 py-2 text-sm font-medium hover:bg-gray-200 rounded">
                Dashboard
              </a>
              <a href="#" className="px-3 py-2 text-sm font-medium hover:bg-gray-200 rounded">
                Team
              </a>
              <a href="#" className="px-3 py-2 text-sm font-medium hover:bg-gray-200 rounded">
                Projects
              </a>
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