// src/components/Core/Layout/Header/MobileNav.tsx
"use client";

import { useMenu } from "@/contexts/MenuContext";
import { useLookup } from "@/contexts/LookupContext";
import Image from "next/image";
interface MobileNavProps {
  setIsLoginOpen: (isOpen: boolean) => void;
  setIsLookupOpen?: (isOpen: boolean) => void; // Thêm prop này, optional để tương thích với các trường hợp khác
}

export default function MobileNav({
  setIsLoginOpen,
  setIsLookupOpen,
}: MobileNavProps) {
  const { setIsOpen: setIsMenuOpen } = useMenu();
  const { setIsLookupOpen: setIsLookupOpenFromContext } = useLookup();

  // Sử dụng setIsLookupOpen từ props nếu có, nếu không thì dùng từ context
  const handleSetIsLookupOpen = setIsLookupOpen || setIsLookupOpenFromContext;

  return (
    <div className="flex items-center space-x-[0.75rem] laptop:hidden desktop:hidden">
      <button
        type="button"
        className="text-gray-400 hover:text-black focus:ring-2 focus:ring-gray-300 focus:outline-none"
        onClick={() => handleSetIsLookupOpen(true)}
        aria-label="Open Lookup"
      >
        <Image
          src="/nav/nav_lookup.svg"
          alt="Lookup"
          width={120}
          height={40}
          className="h-6 w-auto"
        />
      </button>
      <button
        type="button"
        className="text-gray-400 hover:text-black focus:ring-2 focus:ring-gray-300 focus:outline-none"
        onClick={() => setIsLoginOpen(true)}
      >
        <Image
          src="/nav/nav_user.svg"
          alt="Nav User"
          width={120}
          height={40}
          className="h-6 w-auto"
        />
      </button>
      <a href="/cart">
        <Image
          src="/nav/nav_cart.svg"
          alt="Nav Cart"
          width={120}
          height={40}
          className="h-6 w-auto"
        />
      </a>
      <button
        type="button"
        className="text-gray-400 hover:text-black focus:ring-2 focus:ring-gray-300 focus:outline-none"
        onClick={() => setIsMenuOpen(true)}
      >
        <Image
          src="/nav/nav_bugger.svg"
          alt="Menu"
          width={120}
          height={40}
          className="h-6 w-auto"
        />
      </button>
    </div>
  );
}
