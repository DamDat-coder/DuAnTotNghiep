// src/admin/components/AdminNavigation.tsx
"use client";

import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

export interface NavigationItem {
  label: string;
  href: string;
  filter?: string;
}

interface AdminNavigationProps {
  items: NavigationItem[];
  currentFilter: string;
  onFilter?: (filter: string) => void;
  addButton?: {
    label: string;
    href: string;
  };
}

export default function AdminNavigation({
  items,
  currentFilter,
  onFilter,
  addButton,
}: AdminNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();

  const showAddButton = !pathname.startsWith("/admin/order") && addButton;

  const handleFilterClick = (filter: string) => {
    if (onFilter) {
      onFilter(filter);
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <nav className="bg-white p-6 my-10 w-full mx-auto rounded-[2.125rem] flex justify-between items-center">
      {/* Navigation items */}
      <ul className="flex gap-4">
        {items.map((item) => (
          <li key={item.filter || "Tất cả"}>
            <button
              onClick={() => handleFilterClick(item.filter || "Tất cả")}
              className={`p-6 border-t-2 font-semibold text-xl ${
                currentFilter === (item.filter || "Tất cả")
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
          className="px-6 py-4 text-base bg-[#02203b] text-white font-semibold rounded-full hover:bg-[#305970] flex items-center gap-[0.75rem]"
        >
          <Image
            src="/admin/admin_navigation/admin_navigation_add.svg"
            alt="Add Icon"
            width={20}
            height={20}
            className="inline-block"
          />
          <span>{addButton.label}</span>
        </button>
      )}
    </nav>
  );
}