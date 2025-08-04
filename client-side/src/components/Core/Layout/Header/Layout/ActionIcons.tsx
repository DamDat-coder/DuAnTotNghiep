"use client";

import Image from "next/image";
import Link from "next/link";
import NotificationIcon from "./Notification";
import UserDropdown from "./UserDropdown";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push("/profile?tab=favorite");
  };

  return (
    <>
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
      <NotificationIcon />
      <Link href="/cart" className="text-gray-400 hover:text-black" aria-label="Giỏ hàng">
        <Image
          src="/nav/nav_cart.svg"
          alt="Giỏ hàng"
          width={24}
          height={24}
          className="h-6 w-auto"
        />
      </Link>
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