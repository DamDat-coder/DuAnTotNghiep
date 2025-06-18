"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { API_BASE_URL } from "@/services/api";

interface Category {
  _id: string;
  name: string;
  parentid: string | null;
}

export default function DesktopNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch(`${API_BASE_URL}/categories`, {
          cache: "no-store",
        });
        if (!res.ok) {
          throw new Error("Không thể lấy danh mục");
        }
        const data = await res.json();
        // Lọc danh mục có parentid === null
        const rootCategories = data.data.filter(
          (cat: Category) => cat.parentid === null
        );
        setCategories(rootCategories);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Lỗi khi tải danh mục");
      }
    }

    fetchCategories();
  }, []);

  // Tạo danh sách liên kết động từ danh mục
  const navLinks = categories.map((cat) => {
    // Xử lý đặc biệt cho danh mục "Bài viết"
    if (cat._id === "684d0f12543e02998d9df097" || cat.name === "Bài viết") {
      return {
        href: "/posts",
        label: cat.name,
      };
    }
    // Các danh mục khác
    return {
      href: `/products?id_cate=${cat._id}`,
      label: cat.name,
    };
  });

  if (error) {
    console.error(error);
  }

  return (
    <div className="hidden laptop:flex desktop:flex items-center gap-5">
      {navLinks.map((link) => {
        // Tạo URLSearchParams từ link.href
        const linkSearchParams = new URLSearchParams(
          link.href.split("?")[1] || ""
        );
        const linkIdCate = linkSearchParams.get("id_cate");

        // Kiểm tra xem link có phải là link hiện tại không
        const isActive =
          link.href === "/posts"
            ? pathname === "/posts"
            : pathname === "/products" && linkIdCate
            ? searchParams.get("id_cate") === linkIdCate
            : false;

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