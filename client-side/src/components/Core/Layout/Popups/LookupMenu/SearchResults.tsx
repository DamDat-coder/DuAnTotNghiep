// src/components/Core/Popups/LookupMenu/SearchResults.tsx
"use client";

import Image from "next/image";
import React from "react";
import Link from "next/link";
import { IProduct } from "@/types";

interface SearchResultsProps {
  filteredProducts: IProduct[];
  searchTerm: string;
  isMobile: boolean;
  products: IProduct[];
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
    return (
      <p className="text-base text-gray-500">Không tìm thấy sản phẩm nào.</p>
    );
  }

  return (
    <div
      className={`grid gap-4 text-left ${
        isMobile ? "grid-cols-2" : "grid-cols-3"
      }`}
    >
      {filteredProducts.map((product) => {
        const discountPrice = Math.round(
          product.price * (1 - (product.discountPercent || 0) / 100)
        );
        return (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className=" w-full flex flex-col bg-white relative"
          >
            <div className="product w-full h-auto font-description">
              <Image
                src={`/product/img/${product.images[0]}`}
                alt={product.name || "Sản phẩm"}
                width={363}
                height={363}
                className="w-[16.8125rem] h-[16.8125rem] desktop:w-[22.6875rem] desktop:h-[22.6875rem] laptop:w-[22.6875rem] laptop:h-[22.6875rem] object-cover"
                draggable={false}
              />
             
              <div className="content flex flex-col p-4">
                <div className="name text-lg font-bold text-[#374151] pb-2 truncate">
                  {product.name || "Sản phẩm"}
                </div>
                <div className="category text-base text-[#374151] truncate">
                  {product.category || "Danh mục"}
                </div>
                <div className="price-container flex items-center gap-3 pt-2">
                  <div className="discountPrice text-[1rem] font-bold text-red-500">
                    {discountPrice.toLocaleString("vi-VN")}₫
                  </div>
                  <div className="price text-[0.875rem] text-[#374151] line-through">
                    {product.price.toLocaleString("vi-VN")}₫
                  </div>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
