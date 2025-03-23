"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Breadcrumb() {
  const pathname = usePathname(); // Lấy đường dẫn hiện tại

  // Chia nhỏ pathname thành các đoạn
  const pathSegments = pathname.split("/").filter((segment) => segment);

  // Không hiển thị breadcrumb trên trang chủ
  if (pathname === "/") {
    return null;
  }

  return (
    <nav className="text-base">
      <ul className="flex items-center gap-2">
        {/* Trang chủ luôn có */}
        <li>
          <Link href="/" className="text-[#d1d1d1] hover:underline">
            Trang chủ
          </Link>
        </li>

        {/* Các đoạn tiếp theo */}
        {pathSegments.map((segment, index) => {
          const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
          const isLast = index === pathSegments.length - 1;
          const label =
            segment === "products"
              ? "Sản phẩm"
              : segment.charAt(0).toUpperCase() + segment.slice(1); // Viết hoa chữ đầu

          return (
            <li key={href} className="flex items-center gap-2">
              <span className="text-[#d1d1d1]">{">"}</span>
              {isLast ? (
                <span className="text-black">{label}</span> // Trang hiện tại màu đen
              ) : (
                <Link href={href} className="text-[#d1d1d1] hover:underline">
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}