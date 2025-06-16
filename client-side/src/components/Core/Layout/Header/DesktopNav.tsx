"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const navLinks = [
  { href: "/products?category=Unisex", label: "Unisex" },
  { href: "/products?category=Nam", label: "Nam" },
  { href: "/products?category=Nữ", label: "Nữ" },
  // { href: "/products?discount=true", label: "Giảm giá" },
  { href: "/posts", label: "Bài viết" },
];

export default function DesktopNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <div className="hidden laptop:flex desktop:flex items-center space-x-6">
      {navLinks.map((link) => {
        // Tạo URLSearchParams từ link.href
        const linkSearchParams = new URLSearchParams(
          link.href.split("?")[1] || ""
        );
        const linkCategory = linkSearchParams.get("category");
        const linkDiscount = linkSearchParams.get("discount");

        // Kiểm tra xem link có phải là link hiện tại không
        const isActive =
          link.href === "/"
            ? pathname === "/"
            : pathname === "/products" &&
              (linkCategory
                ? searchParams.get("category") === linkCategory
                : linkDiscount
                ? searchParams.get("discount") === linkDiscount
                : false);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`px-2 py-2 text-xl ${
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
