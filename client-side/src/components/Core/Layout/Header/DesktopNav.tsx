"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ICategory } from "@/types/category";
import { motion, AnimatePresence } from "framer-motion";
import { useCategories } from "@/contexts/CategoriesContext";

export default function DesktopNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { tree, isLoading, error } = useCategories();

  // Lọc danh mục gốc (parentId = null)
  const rootCategories = tree.filter((cat) => cat.parentId === null);

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 64);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMouseEnter = useCallback((categoryId: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setHoveredCategory(categoryId);
  }, []);

  const handleMouseLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setHoveredCategory(null);
    }, 50);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const dropdownVariants = {
    initial: { y: -64, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: {
      y: -64,
      opacity: 0,
      transition: { type: "spring", stiffness: 300, damping: 25 },
    },
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

  return (
    <div className="hidden laptop:flex desktop:flex items-center gap-5">
      {rootCategories.length === 0 ? (
        <p className="text-gray-500">Không có danh mục</p>
      ) : (
        rootCategories.map((cat) => {
          const isArticleCategory =
            cat._id === "684d0f12543e02998d9df097" || cat.name === "Bài viết";
          const href = isArticleCategory
            ? "/posts"
            : `/products?id_cate=${cat._id}`;
          const isActive = isArticleCategory
            ? pathname === "/posts"
            : pathname === "/products" &&
              searchParams.get("id_cate") === cat._id;

          return (
            <div key={cat._id} className="relative">
              <Link
                href={href}
                className={`px-5 py-5 text-lg ${
                  isActive ? "font-bold" : "font-medium text-gray-800"
                } rounded transition-colors`}
                aria-expanded={hoveredCategory === cat._id}
                aria-haspopup="true"
                onMouseEnter={() => handleMouseEnter(cat._id)}
              >
                {cat.name}
              </Link>
              {!isArticleCategory && cat.children?.length > 0 && (
                <AnimatePresence>
                  {hoveredCategory === cat._id && (
                    <motion.div
                      variants={dropdownVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 40,
                      }}
                      className={
                        "fixed top-16 left-0 right-0 w-screen bg-white shadow-lg z-[80]"
                      }
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-3 gap-4">
                        {cat.children.map((child) => (
                          <Link
                            key={child._id}
                            href={`/products?id_cate=${child._id}`}
                            className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors text-center"
                            onClick={() => setHoveredCategory(null)}
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          );
        })
      )}
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
