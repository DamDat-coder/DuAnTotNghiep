// src/components/Core/Popups/LookupMenu/SearchResults.tsx
"use client";

import React from "react";
import Link from "next/link";
import { IProduct } from "@/types";

interface SearchResultsProps {
  filteredProducts: IProduct[];
  searchTerm: string;
  isMobile: boolean;
}

export default function SearchResults({
  filteredProducts,
  searchTerm,
  isMobile,
}: SearchResultsProps) {
  if (!searchTerm) {
    return (
      <div className="flex flex-col gap-6">
        <h3 className="text-lg font-medium">Cụm từ tìm kiếm phổ biến</h3>
        <div className="flex flex-wrap gap-4">
          {["áo khoác", "áo thun MBL", "giày thể thao", "quần jeans"].map(
            (term, index) => (
              <a
                key={index}
                className="flex justify-center items-center px-[0.78125rem] py-3 bg-[#ededed] rounded-full text-base"
                href={`/products?search=${term}`}
              >
                {term}
              </a>
            )
          )}
        </div>
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return <p className="text-base text-gray-500">Không tìm thấy sản phẩm nào.</p>;
  }

  return (
    <div
      className={`grid gap-4 text-left ${
        isMobile ? "grid-cols-2" : "grid-cols-3"
      }`}
    >
      {filteredProducts.map((product) => (
        <Link
          key={product.id}
          href={`/products/${product.id}`}
          className="flex flex-col bg-[#ededed] rounded-lg p-3"
        >
          <img
            src={`/featured/${product.image[0]}`}
            alt={product.name}
            className="w-full h-24 object-cover rounded"
          />
          <span className="text-base font-bold text-center mt-2 truncate w-full">
            {product.name}
          </span>
          <span className="text-base opacity-40 font-bold truncate w-full">
            {product.category}
          </span>
          <span className="text-base font-bold mt-1">
            {(product.price * (1 - product.discountPercent / 100)).toLocaleString(
              "vi-VN"
            )}
            ₫
          </span>
        </Link>
      ))}
    </div>
  );
}