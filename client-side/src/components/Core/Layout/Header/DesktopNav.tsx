"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { fetchParentCategories } from "@/services/categoryApi";

interface Category {
  id: string;
  name: string;
  description: string;
  parentid: string | null;
}

export default function DesktopNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCategories() {
      try {
        setLoading(true);
        const rootCategories = await fetchParentCategories();
        setCategories(rootCategories);

      } catch (err) {
        setError(err instanceof Error ? err.message : "Lỗi khi tải danh mục");
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, []);

  // Tạo danh sách liên kết động từ danh mục
  const navLinks = categories.map((cat) => {
    if (cat.id === "684d0f12543e02998d9df097" || cat.name === "Bài viết") {
      return {
        href: "/posts",
        label: cat.name,
      };
    }
    return {
      href: `/products?id_cate=${cat.id}`,
      label: cat.name,
    };
  });

  if (loading) {
    return <div className="hidden laptop:flex desktop:flex items-center gap-5">Đang tải...</div>;
  }

  if (error) {
    return (
      <div className="hidden laptop:flex desktop:flex items-center gap-5 text-red-500">
        Lỗi: {error}
      </div>
    );
  }

  return (
    <div className="hidden laptop:flex desktop:flex items-center gap-5">
      {navLinks.length === 0 ? (
        <p className="text-gray-500">Không có danh mục nào</p>
      ) : (
        navLinks.map((link) => {
          const linkSearchParams = new URLSearchParams(
            link.href.split("?")[1] || ""
          );
          const linkIdCate = linkSearchParams.get("id_cate");

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
        })
      )}
    </div>
  );
}