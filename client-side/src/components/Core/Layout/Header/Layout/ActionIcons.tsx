"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import NotificationIcon from "./Notification";
import UserDropdown from "./UserDropdown";
import { useCart } from "@/contexts/CartContext";

interface ActionIconsProps {
  isClient: boolean;
  user: any;
  setIsLoginOpen: (isOpen: boolean) => void;
  setIsMenuOpen: (isOpen: boolean) => void;
  isMenuOpen: boolean;
}

export default function ActionIcons({
  isClient,
  user,
  setIsLoginOpen,
  setIsMenuOpen,
  isMenuOpen,
}: ActionIconsProps) {
  const { cartItemCount } = useCart();
  const [isMounted, setIsMounted] = useState(false);

  // Set isMounted to true after component mounts on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = "/profile?tab=favorite";
  };

  return (
    <>
      {/* Yêu thích */}
      <Link
        href="/profile?tab=favorite"
        className="text-gray-400 hover:text-black hidden tablet:hidden laptop:block desktop:block"
        aria-label="Danh sách yêu thích"
        onClick={handleFavoriteClick}
      >
        <Image
          src="/nav/nav_like_desktop.svg"
          alt="Yêu thích"
          width={24}
          height={24}
          className="h-[1.05rem] w-auto"
        />
      </Link>

      {/* Thông báo */}
      <NotificationIcon />

      {/* Giỏ hàng */}
      <Link
        href="/cart"
        className="text-gray-400 hover:text-black relative"
        aria-label="Giỏ hàng"
      >
        <Image
          src="/nav/nav_cart.svg"
          alt="Giỏ hàng"
          width={24}
          height={24}
          className="h-[1.2rem] w-auto"
        />
        {isMounted && cartItemCount > 0 && (
          <span
            className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center"
            aria-label={`Có ${cartItemCount} sản phẩm trong giỏ hàng`}
          >
            {cartItemCount}
          </span>
        )}
      </Link>

      {/* Người dùng */}
      {isClient && user ? (
        <UserDropdown />
      ) : (
        <button
          type="button"
          className="hidden tablet:hidden laptop:block desktop:block text-gray-400 hover:text-black"
          onClick={() => setIsLoginOpen(true)}
          aria-label="Đăng nhập"
        >
          <Image
            src="/nav/nav_user.svg"
            alt="Người dùng"
            width={24}
            height={24}
            className="h-6 w-auto"
          />
        </button>
      )}

      {/* Menu mobile */}
      <button
        type="button"
        className="laptop:hidden desktop:hidden text-gray-400 hover:text-black"
        onClick={() => setIsMenuOpen(true)}
        aria-label="Mở menu di động"
        aria-expanded={isMenuOpen}
      >
        <Image
          src="/nav/nav_bugger.svg"
          alt="Menu"
          width={24}
          height={24}
          className="h-6 w-auto"
        />
      </button>
    </>
  );
}