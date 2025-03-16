// src/components/LookupMenu.tsx
"use client";

import React, { useState, useEffect } from "react";
import { fetchProducts } from "../services/api";
import { Product } from "../types";
import Link from "next/link";
interface LookupMenuProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function LookupMenu({ isOpen, setIsOpen }: LookupMenuProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  // Chặn cuộn trang chính khi popup mở
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    // Cleanup khi component unmount hoặc isOpen thay đổi
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isOpen]);

  const handleClear = () => {
    setSearchTerm("");
  };

  const suggestions = filteredProducts
    .map((product) => product.name)
    .slice(0, 3);

  return (
    <div
      className={`fixed inset-0 text-black bg-white transform transition-transform duration-300 ease-in-out z-50 tablet:hidden flex flex-col ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Thanh tìm kiếm và nút Hủy bỏ (cố định) */}
      <div className="px-6 pt-4 pb-6 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="relative bg-[#687176] w-[17rem] rounded-full flex items-center">
            <img
              src="/nav/nav_lookup_input.svg"
              alt="Search"
              className="absolute left-4 h-5 w-5"
            />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2 pl-12 pr-12 text-lg text-black bg-[#ededed] border-none rounded-full focus:outline-none focus:ring-0 placeholder:text-base placeholder:text-[#687176] truncate"
            />
            {searchTerm && (
              <button
                type="button"
                className="absolute right-4 flex items-center"
                onClick={handleClear}
              >
                <img src="/nav/nav_clear.svg" alt="Clear" className="h-[0.875rem] w-[0.875rem]" />
              </button>
            )}
          </div>
          <button
            type="button"
            className="text-black hover:text-gray-800 focus:ring-2 focus:ring-black focus:outline-none whitespace-nowrap"
            onClick={() => setIsOpen(false)}
          >
            Hủy bỏ
          </button>
        </div>
      </div>

      {/* Nội dung cuộn */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="flex flex-col gap-6">
          {isLoading ? (
            <p className="text-base text-gray-500">Đang tải...</p>
          ) : searchTerm ? (
            <>
              {suggestions.length > 0 && (
                <div className="flex flex-col gap-2">
                  {suggestions.map((suggestion, index) => (
                    <a
                      key={index}
                      href="#"
                      className="text-base text-black hover:bg-gray-200 py-1 px-2 rounded"
                    >
                      {suggestion}
                    </a>
                  ))}
                </div>
              )}
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {filteredProducts.map((product) => (
                    <a
                      key={product.id}
                      href="#"
                      className="flex flex-col items-center bg-[#ededed] rounded-lg p-3"
                    >
                      <img
                        src={`/featured/${product.image}`}
                        alt={product.name}
                        className="w-full h-24 object-cover rounded"
                      />
                      <span className="text-base text-center mt-2 truncate w-full">
                        {product.name}
                      </span>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-base text-gray-500">Không tìm thấy sản phẩm nào.</p>
              )}
            </>
          ) : (
            <div className="flex flex-col gap-6">
              <h3 className="text-lg font-medium">Cụm từ tìm kiếm phổ biến</h3>
              <div className="flex flex-wrap gap-4">
                <a
                  className="flex justify-center items-center px-[0.78125rem] py-3 bg-[#ededed] rounded-full text-base"
                  href="#"
                >
                  áo khoác
                </a>
                <a
                  className="flex justify-center items-center px-[0.78125rem] py-3 bg-[#ededed] rounded-full text-base"
                  href="#"
                >
                  áo thun MBL
                </a>
                <a
                  className="flex justify-center items-center px-[0.78125rem] py-3 bg-[#ededed] rounded-full text-base"
                  href="#"
                >
                  giày thể thao
                </a>
                <a
                  className="flex justify-center items-center px-[0.78125rem] py-3 bg-[#ededed] rounded-full text-base"
                  href="#"
                >
                  quần jeans
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}