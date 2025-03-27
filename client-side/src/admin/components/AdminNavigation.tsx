// src/admin/components/AdminNavigation.tsx
"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

interface NavigationItem {
  label: string;
  href: string;
  filter?: string;
}

interface AdminNavigationProps {
  items: NavigationItem[];
  onFilter?: (filter: string) => void;
  addButton?: {
    label: string;
    href: string;
  };
}

export default function AdminNavigation({ items, onFilter, addButton }: AdminNavigationProps) {
  const [activeFilter, setActiveFilter] = useState<string>("Tất cả");
  const pathname = usePathname();
  const router = useRouter();

  const showAddButton = !pathname.startsWith("/admin/order") && addButton;

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
    if (onFilter) {
      onFilter(filter);
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <nav className="bg-white p-6 my-10 w-[95%] mx-auto rounded-[2.125rem] flex justify-between items-center">
      {/* Navigation items */}
      <ul className="flex gap-4">
        {items.map((item) => (
          <li key={item.href}>
            <button
              onClick={() => handleFilterClick(item.filter || "Tất cả")}
              className={`p-6 border-t-2 font-semibold text-xl ${
                activeFilter === (item.filter || "Tất cả")
                  ? "border-t-black text-black font-semibold"
                  : "border-t-transparent text-black font-semibold opacity-60"
              }`}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>

      {/* Nút Thêm */}
      {showAddButton && (
        <button
          onClick={() => router.push(addButton.href)}
          className="px-6 py-4 text-base bg-[#02203b] text-white font-semibold rounded-full hover:bg-[#305970] flex items-center gap-[0.75rem]" // gap 12px = 0.75rem
        >
          <Image
            src="/admin/admin_navigation/admin_navigation_add.svg"
            alt="Add Icon"
            width={20} // Điều chỉnh kích thước icon nếu cần
            height={20}
            className="inline-block"
          />
          <span>{addButton.label}</span>
        </button>
      )}
    </nav>
  );
}