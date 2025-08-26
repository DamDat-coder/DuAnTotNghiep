"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useCategories } from "@/contexts/CategoriesContext";

export default function DesktopNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { tree, isLoading, error } = useCategories();

  // Danh mục gốc
  const rootCategories = (tree || []).filter((cat) => cat.parentId === null);

  // Dùng kiểu an toàn cho cả browser & node
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const handleMouseEnter = useCallback((categoryId: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setHoveredCategory(categoryId);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    timeoutRef.current = setTimeout(() => {
      setHoveredCategory(null);
      timeoutRef.current = null;
    }, 80);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  const dropdownVariants: Variants = {
    initial: { y: -12, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { duration: 0.18 } },
    exit: { y: -12, opacity: 0, transition: { duration: 0.14 } },
  };

  if (isLoading) {
    return (
      <div className="hidden laptop:flex desktop:flex items-center gap-5">
        Đang tải danh mục...
      </div>
    );
  }

  if (error) {
    return (
      <div className="hidden laptop:flex desktop:flex items-center gap-5 text-red-500">
        Lỗi: {error}
      </div>
    );
  }

  if (!rootCategories?.length) {
    return (
      <div className="hidden laptop:flex desktop:flex items-center gap-5 text-gray-500">
        Không có danh mục
      </div>
    );
  }

  return (
    <div
      className="hidden laptop:flex desktop:flex items-center gap-5"
      onMouseLeave={handleMouseLeave}
    >
      {rootCategories.map((cat) => {
        const isArticleCategory =
          cat._id === "684d0f12543e02998d9df097" || cat.name === "Bài viết";

        const href = isArticleCategory
          ? "/posts"
          : `/products?id_cate=${cat._id}`;

        const isActive = isArticleCategory
          ? pathname === "/posts"
          : pathname === "/products" && searchParams.get("id_cate") === cat._id;

        const hasChildren = Array.isArray(cat.children) && cat.children.length > 0;

        return (
          <div
            key={cat._id}
            className="relative"
            onMouseEnter={() => handleMouseEnter(cat._id)}
          >
            <Link
              href={href}
              className={`px-5 py-5 text-lg ${
                isActive ? "font-bold" : "font-medium text-gray-800"
              } rounded transition-colors`}
              aria-haspopup={hasChildren}
              aria-expanded={hoveredCategory === cat._id}
            >
              {cat.name}
            </Link>

            {/* Dropdown cho mọi danh mục có children, bao gồm “Bài viết” */}
            <AnimatePresence>
              {hasChildren && hoveredCategory === cat._id && (
                <motion.div
                  variants={dropdownVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="fixed top-16 left-0 right-0 w-full bg-white shadow-lg z-[80]"
                  onMouseEnter={() => handleMouseEnter(cat._id)}
                >
                  <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-3 gap-4">
                    {/* (Tùy chọn) Mục 'Tất cả bài viết' cho nhóm Bài viết */}
                    {isArticleCategory && (
                      <Link
                        href="/posts"
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded text-center font-medium"
                        onClick={() => setHoveredCategory(null)}
                      >
                        Tất cả bài viết
                      </Link>
                    )}

                    {cat.children!.map((child) => {
                      const childHref = isArticleCategory
                        ? `/posts?cate_id=${child._id}` // đổi sang slug nếu cần
                        : `/products?id_cate=${child._id}`;

                      return (
                        <Link
                          key={child._id}
                          href={childHref}
                          className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded text-center"
                          onClick={() => setHoveredCategory(null)}
                        >
                          {child.name}
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      <Link
        href="/coupons"
        className={`px-5 py-5 text-lg ${
          pathname === "/coupons" ? "font-bold" : "font-medium text-gray-800"
        } rounded transition-colors`}
      >
        Giảm giá
      </Link>
    </div>
  );
}
