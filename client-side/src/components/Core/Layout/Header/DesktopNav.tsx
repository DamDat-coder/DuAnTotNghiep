"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const navLinks = [
  { href: "/", label: "Trang chủ" },
  { href: "/products?gender=Nam", label: "Nam" },
  { href: "/products?gender=Nữ", label: "Nữ" },
  { href: "/products?gender=Unisex", label: "Unisex" },
  { href: "/products?discount=true", label: "Giảm giá" },
  { href: "/posts", label: "Bài viết" },
];

export default function DesktopNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <div className="hidden desktop:flex items-center space-x-6">
      {navLinks.map((link) => {
        // Tạo URLSearchParams từ link.href
        const linkSearchParams = new URLSearchParams(link.href.split("?")[1] || "");
        const linkGender = linkSearchParams.get("gender");
        const linkDiscount = linkSearchParams.get("discount");

        // Kiểm tra xem link có phải là link hiện tại không
        const isActive =
          link.href === "/"
            ? pathname === "/"
            : pathname === "/products" &&
              (linkGender
                ? searchParams.get("gender") === linkGender
                : linkDiscount
                ? searchParams.get("discount") === linkDiscount
                : false);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`px-3 py-2 text-xl ${
              isActive ? "font-bold" : "font-medium"
            } hover:bg-gray-200 rounded`}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}