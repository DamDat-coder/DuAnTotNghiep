// src/components/Core/Popups/LookupMenu/LookupMenu.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { fetchProducts } from "@/services/api";
import { IProduct } from "@/types";
import SearchInput from "./SearchInput";
import SearchSuggestions from "./SearchSuggestions";
import SearchResults from "./SearchResults";

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

  // Debug isOpen
  console.log("LookupMenu received isOpen:", isOpen);

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

  // Chặn cuộn trang chính khi popup mở (chỉ trên mobile)
  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isOpen, isMobile]);

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

  const suggestions = filteredProducts.map((product) => product.name).slice(0, 3);
  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
  };

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className={`bg-white z-[60] text-black ${
        isMobile
          ? "fixed inset-0 flex flex-col"
          : "fixed top-16 left-0 right-0 max-w-[600px] mx-auto shadow-lg rounded-b-lg"
      }`}
    >
      {/* Thanh tìm kiếm */}
      <SearchInput
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        setIsOpen={setIsOpen}
        isMobile={isMobile}
      />

      {/* Nội dung cuộn */}
      <div
        className={`${
          isMobile ? "flex-1 overflow-y-auto px-6 pb-6" : "max-h-[400px] overflow-y-auto p-4"
        }`}
      >
        <div className="flex flex-col gap-6">
          {isLoading ? (
            <p className="text-base text-gray-500">Đang tải...</p>
          ) : (
            <>
              <SearchSuggestions
                suggestions={suggestions}
                handleSuggestionClick={handleSuggestionClick}
              />
              <SearchResults
                filteredProducts={filteredProducts}
                searchTerm={searchTerm}
                isMobile={isMobile}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}