// src/components/Core/Layout/MobileMenu/MenuLinks.tsx
"use client";

import Image from "next/image";
import Link from "next/link";

const menuLinks = [
  { href: "/", label: "Trang chủ" },
  { href: "/products?gender=unisex", label: "Unisex" },
  { href: "/products?gender=nam", label: "Nam" },
  { href: "/products?gender=nu", label: "Nữ" },
  { href: "/products?discount=true", label: "Giảm giá" },
  { href: "/posts", label: "Bài viết", noArrow: true },
];

interface MenuLinksProps {
  onClose: () => void;
}

export default function MenuLinks({ onClose }: MenuLinksProps) {
  return (
    <div className="flex flex-col items-start gap-4">
      {menuLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="text-2xl font-medium w-full text-black desktop:hover:bg-gray-700 py-2 rounded flex items-center justify-between"
          onClick={onClose}
        >
          {link.label}
          {!link.noArrow && (
            <Image
              src="/nav/nav_angle_left.svg"
              alt="Arrow"
              width={8}
              height={16}
              className="object-cover z-0"
              draggable={false}
              loading="lazy"
            />
          )}
        </Link>
      ))}
    </div>
  );
}