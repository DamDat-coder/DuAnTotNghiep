"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Image from "next/image";
import { useMenu } from "@/contexts/MenuContext";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import DesktopNav from "../Navigation/DesktopNav";
import UserDropdown from "./UserDropdown";
import MobileMenu from "./MobileMenu";
import LoginPopup from "../../Popups/AuthAction/LoginPopup";
import RegisterPopup from "../../Popups/AuthAction/RegisterPopup";
import ForgotPasswordPopup from "../../Popups/PasswordAction/ForgotPasswordPopup";
import ResetPasswordPopup from "../../Popups/PasswordAction/ResetPasswordPopup";
import ActionIcons from "./ActionIcons";
import SearchSection from "./SearchSection";
import { throttle } from "lodash";

export default function Header() {
  const { isOpen: isMenuOpen, setIsOpen: setIsMenuOpen } = useMenu();
  const { user, openLoginWithData, setOpenLoginWithData, registerFormData } =
    useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = throttle(() => {
      setScrolled(window.scrollY > 64);
    }, 100);

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (openLoginWithData) {
      setIsLoginOpen(false);
      setOpenLoginWithData(false);
    }
  }, [openLoginWithData, setOpenLoginWithData]);

  return (
    <>
      <div className="relative">
        <div className="h-16" /> {/* Placeholder để tránh layout shift */}
        <nav
          ref={navRef}
          className={`${
            scrolled
              ? "fixed top-0 shadow-md translate-y-0"
              : "absolute top-0 translate-y-0"
          } left-0 right-0 bg-white z-[40] transition-[box-shadow,background-color] duration-300 ease-in-out will-change-transform`}
          aria-label="Main navigation"
        >
          <div className="w-full mx-auto px-4 max-w-[2560px] laptop:px-8 desktop:px-8">
            <div className="flex h-16 items-center justify-between relative">
              <Link
                href="/"
                className="flex items-center flex-shrink-0 h-full py-1"
                aria-label="Trang chủ"
              >
                <Image
                  src="https://res.cloudinary.com/testupload1/image/upload/v1755232178/logoDen_zjms3c.png"
                  alt="Logo"
                  width={120}
                  height={40}
                  className="h-full w-auto"
                  draggable={false}
                  priority
                />
              </Link>
              <div className="flex-1 flex justify-center mr-[6.9375rem]">
                <Suspense fallback={null}>
                  <DesktopNav />
                </Suspense>
              </div>
              <div className="flex items-center gap-3 w-[14.5rem] justify-end absolute right-0">
                <div className="flex items-center gap-3 relative">
                  <SearchSection />
                  <ActionIcons
                    isClient={isClient}
                    user={user}
                    setIsLoginOpen={setIsLoginOpen}
                    setIsMenuOpen={setIsMenuOpen}
                    isMenuOpen={isMenuOpen}
                  />
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>

      <MobileMenu isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} />
      <LoginPopup
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onOpenRegister={() => {
          setIsLoginOpen(false);
          setIsRegisterOpen(true);
        }}
        initialFormData={registerFormData}
        onOpenForgotPassword={() => {
          setIsLoginOpen(false);
          setIsForgotOpen(true);
        }}
      />
      <RegisterPopup
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onOpenLogin={() => {
          setIsRegisterOpen(false);
          setIsLoginOpen(true);
        }}
      />
      <ForgotPasswordPopup
        isOpen={isForgotOpen}
        onClose={() => setIsForgotOpen(false)}
        onOpenLogin={() => {
          setIsForgotOpen(false);
          setIsLoginOpen(true);
        }}
      />
      <ResetPasswordPopup
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        token={resetToken}
      />
    </>
  );
}
