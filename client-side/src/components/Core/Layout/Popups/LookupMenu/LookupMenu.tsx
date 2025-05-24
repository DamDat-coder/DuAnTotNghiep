"use client";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { fetchProducts } from "@/services/productApi";
import { IProduct } from "@/types";
import SearchInput from "./SearchInput";
import SearchSuggestions from "./SearchSuggestions";
import SearchResults from "./SearchResults";
import { motion } from "framer-motion";

interface LookupMenuProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function LookupMenu({ isOpen, setIsOpen }: LookupMenuProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<IProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<IProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Xác định thiết bị (mobile hay desktop/tablet)
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768; // 768px là breakpoint cho tablet
      setIsMobile(mobile);
      console.log("isMobile:", mobile); // Debug
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Lấy danh sách sản phẩm từ API khi component mount
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      const data = await fetchProducts();
      setProducts(data);
      setIsLoading(false);
    };
    loadProducts();
  }, []);

  // Lọc sản phẩm khi searchTerm thay đổi
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProducts([]);
    } else {
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  // Chặn cuộn trang chính khi popup mở (trên tất cả thiết bị)
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isOpen]);

  // Đóng menu khi nhấn ra ngoài (chỉ trên desktop/tablet)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        !isMobile &&
        menuRef.current &&
        !menuRef.current.contains(target) &&
        !target.closest('button[aria-label="Open Lookup"]')
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, isMobile, setIsOpen]);

  // Debug render
  useEffect(() => {
    if (isOpen) {
      console.log("LookupMenu is rendered");
      console.log("LookupMenu className:", menuRef.current?.className);
    }
  }, [isOpen]);

  const suggestions = filteredProducts
    .map((product) => product.name)
    .slice(0, 3);
  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {!isMobile && (
        <motion.div
          className="absolute inset-0 bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => setIsOpen(false)}
        />
      )}
      <motion.div
        ref={menuRef}
        className={`bg-white z-[60] text-black rounded ${
          isMobile
            ? `fixed inset-0 tablet:hidden flex flex-col`
            : "fixed left-0 right-0 w-[100%] h-full mx-auto shadow-lg rounded"
        }`}
        initial={isMobile ? { x: "100vh" } : { y: "-100vh" }}
        animate={isMobile ? { x: 0 } : { y: 0 }}
        exit={isMobile ? { x: "100vh" } : { y: "-100vh" }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        <div className="flex w-[95%] mx-auto items-center justify-between laptop:py-[1.375rem]">
          <Image
            src="/nav/logo.svg"
            alt="Logo"
            width={120}
            height={40}
            className="h-auto w-auto hidden laptop:block desktop:block"
            draggable={false}
            loading="lazy"
          />
          {/* Thanh tìm kiếm */}
          <SearchInput
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            setIsOpen={setIsOpen}
            isMobile={isMobile}
          />
          <button
            type="button"
            className="hidden laptop:block desktop:block text-black hover:text-gray-800 focus:ring-2 focus:ring-black focus:outline-none whitespace-nowrap"
            onClick={() => setIsOpen(false)}
          >
            Hủy bỏ
          </button>
        </div>

        {/* Nội dung cuộn */}
        <div
          className={`${
            isMobile
              ? "flex-1 overflow-y-auto px-6 pb-6"
              : "overflow-y-auto p-4 w-[85%] max-h-[80%] mx-auto"
          }`}
        >
          <div className="flex flex-col gap-6 laptop:flex-row desktop:flex-row">
            {isLoading ? (
              <p className="text-base text-gray-500">Đang tải...</p>
            ) : (
              <>
                <SearchSuggestions
                  suggestions={suggestions}
                  handleSuggestionClick={handleSuggestionClick}
                  onClick={function (suggestion: string): void {
                    throw new Error("Function not implemented.");
                  }}
                />
                <SearchResults
                  filteredProducts={filteredProducts}
                  searchTerm={searchTerm}
                  isMobile={isMobile}
                  products={[]}
                />
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
