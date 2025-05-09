// src/components/Core/Layout/Header/Header.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useMenu } from "@/contexts/MenuContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLookup } from "@/contexts/LookupContext";
import DesktopNav from "./DesktopNav";
import UserDropdown from "./UserDropdown";
import MobileNav from "./MobileNav";
import MobileMenu from "../MobileMenu/MobileMenu";
import LookupMenu from "../Popups/LookupMenu";
import LoginPopup from "../Popups/LoginPopup";
import RegisterPopup from "../Popups/RegisterPopup";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const { isOpen: isMenuOpen, setIsOpen: setIsMenuOpen } = useMenu();
  const { user } = useAuth();
  const { isLookupOpen, setIsLookupOpen } = useLookup();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Debug trạng thái isLookupOpen
  useEffect(() => {
  }, [isLookupOpen]);

  return (
    <>
      <nav className="bg-white text-black relative z-40">
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

            <DesktopNav />

            <div className="flex items-center space-x-[0.75rem]">
              {/* Desktop Actions */}
              <div className="hidden desktop:flex items-center space-x-[0.75rem]">
                <button
                  type="button"
                  className="text-gray-400 hover:text-black focus:ring-2 focus:ring-gray-300 focus:outline-none"
                  onClick={() => setIsLookupOpen(true)}
                  aria-label="Open Lookup"
                >
                  <img src="/nav/nav_lookup.svg" alt="Lookup" className="h-6 w-auto" />
                </button>
                <a href="#" className="text-gray-400 hover:text-black">
                  <img
                    src="/nav/nav_like_desktop.svg"
                    alt="Wishlist"
                    className="h-[1.05rem] w-auto"
                  />
                </a>
                <a href="/cart" className="text-gray-400 hover:text-black">
                  <img src="/nav/nav_cart.svg" alt="Cart" className="h-6 w-auto" />
                </a>
                {isClient && (user ? <UserDropdown /> : (
                  <button
                    type="button"
                    className="text-gray-400 hover:text-black focus:ring-2 focus:ring-gray-300 focus:outline-none"
                    onClick={() => setIsLoginOpen(true)}
                  >
                    <img src="/nav/nav_user.svg" alt="User" className="h-6 w-auto" />
                  </button>
                ))}
              </div>

              {/* Mobile Actions */}
              <MobileNav
                setIsLookupOpen={setIsLookupOpen}
                setIsLoginOpen={setIsLoginOpen}
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Render các popup ở cấp cao nhất */}
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
    </>
  );
}