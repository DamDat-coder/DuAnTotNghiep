// src/components/Core/Layout/MobileMenu/MobileMenu.tsx
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

interface MobileMenuProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function MobileMenu({ isOpen, setIsOpen }: MobileMenuProps) {
  const navItems = [
    { href: "/about", label: "Về chúng tôi" },
    { href: "/products?gender=Nam", label: "Nam" },
    { href: "/products?gender=Nữ", label: "Nữ" },
    { href: "/products?gender=Unisex", label: "Unisex" },
    { href: "/contact", label: "Liên hệ" },
    { href: "/cart", label: "Giỏ hàng" },
  ];

  return (
    <motion.div
      className={`fixed inset-0 text-black bg-white transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
      initial={false}
      animate={{ translateX: isOpen ? "0%" : "100%" }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between p-4 border-b-2 border-[#B0B0B0]">
        <Image
          src="/nav/logo.svg"
          alt="Logo"
          width={120}
          height={40}
          className="h-auto w-auto"
          draggable={false}
          loading="lazy"
        />
        <button
          type="button"
          className="text-gray-400 hover:text-black focus:ring-2 focus:ring-gray-300 focus:outline-none"
          onClick={() => setIsOpen(false)}
        >
          <img src="/nav/Union - Copy.svg" alt="Close" className="h-6 w-auto" />
        </button>
      </div>

      <div className="flex-1 flex flex-col p-4">
        <div className="flex flex-col gap-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-lg font-medium hover:underline"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex justify-between items-center">
                {item.label}
                <Image
                  src="/nav/nav_angle_left.svg"
                  alt="Logo"
                  width={120}
                  height={40}
                  className="h-auto w-auto tablet:w-2"
                  draggable={false}
                  loading="lazy"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
