// src/components/Core/Popups/LookupMenu/SearchResults.tsx
"use client";

import Image from "next/image";
import React from "react";
import Link from "next/link";
import { IProduct } from "@/types/product";

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
                className="flex justify-center items-center px-[0.78125rem] py-3 rounded-full text-base"
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
    <div className="flex flex-col gap-4">
      {filteredProducts.map((product) => {
        const discountPrice = Math.round(
          product.price * (1 - (product.discountPercent || 0) / 100)
        );
        return (
          <Link key={product.id} href={`/products/${product.id}`} className="">
            <div className="flex gap-2">
              <div className="w-1/3 shrink-0">
                <Image
                  src={`/product/img/${product.images[0]}`}
                  alt={product.name || "Sản phẩm"}
                  width={363}
                  height={363}
                  className="w-full h-auto"
                  draggable={false}
                />
              </div>
              <div className="w-2/3">
                <div className="content flex flex-col gap-2">
                  <div className="name text-sm text-[#374151] pb-2 h-[2.5rem] two-line-clamp">
                    {product.name || "Sản phẩm"}
                  </div>

                  <div className="price-container">
                    <div className="discountPrice text-[0.875rem] font-bold text-red-500">
                      {discountPrice.toLocaleString("vi-VN")}₫
                    </div>
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
