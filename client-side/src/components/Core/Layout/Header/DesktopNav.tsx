// src/components/Core/Layout/Header/DesktopNav.tsx
"use client";

import Link from "next/link";

const navLinks = [
  { href: "/", label: "Trang chủ", bold: true },
  { href: "/products?gender=nam", label: "Nam" },
  { href: "/products?gender=nu", label: "Nữ" },
  { href: "/products?discount=true", label: "Giảm giá" },
  { href: "/posts", label: "Bài viết" },
];

export default function DesktopNav() {
  return (
    <div className="hidden desktop:flex items-center space-x-6">
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`px-3 py-2 text-xl ${
            link.bold ? "font-bold" : "font-medium"
          } hover:bg-gray-200 rounded`}
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}