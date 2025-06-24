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
  onResultClick?: () => void; // Thêm prop onResultClick
}

export default function SearchResults({
  filteredProducts,
  searchTerm,
  isMobile,
  onResultClick,
}: SearchResultsProps) {
  // Hiển thị cụm từ tìm kiếm phổ biến khi không có searchTerm
  if (!searchTerm) {
    return (
      <div className="flex flex-col gap-6">
        <h3 className="text-lg font-medium">Cụm từ tìm kiếm phổ biến</h3>
        <div className="flex flex-wrap gap-4">
          {["áo khoác", "áo thun MBL", "giày thể thao", "quần jeans"].map(
            (term, index) => (
              <a
                key={index}
                className="flex justify-center items-center px-[0.78125rem] py-3 rounded-full text-base hover:bg-gray-100"
                href={`/products?search=${encodeURIComponent(term)}`}
                onClick={onResultClick} // Gọi onResultClick khi nhấp
                aria-label={`Tìm kiếm ${term}`}
              >
                {term}
              </a>
            )
          )}
        </div>
      </div>
    );
  }

  // Hiển thị thông báo khi không tìm thấy sản phẩm
  if (filteredProducts.length === 0) {
    return (
      <p className="text-base text-gray-500">Không tìm thấy sản phẩm nào.</p>
    );
  }

  // Hàm tìm variant có giá thấp nhất
  const getLowestPriceVariant = (
    variants: IProduct["variants"]
  ): { price: number; discountPercent: number } => {
    if (!variants || variants.length === 0) {
      return { price: 0, discountPercent: 0 };
    }
    return variants.reduce((lowest, variant) => {
      return variant.price < lowest.price ? variant : lowest;
    }, variants[0]);
  };

  return (
    <div className="flex flex-col gap-4">
      {filteredProducts.map((product) => {
        const { price, discountPercent } = getLowestPriceVariant(product.variants);
        const discountPrice = Math.round(price * (1 - discountPercent / 100));
        const imageSrc = product.images[0]
          ? `/product/img/${product.images[0]}`
          : "/placeholder-image.jpg"; // Fallback ảnh

        return (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="block"
            onClick={onResultClick} // Gọi onResultClick khi nhấp
            aria-label={`Xem chi tiết sản phẩm ${product.name}`}
          >
            <div className="flex gap-2">
              <div className="w-1/3 shrink-0">
                <Image
                  src={imageSrc}
                  alt={product.name || "Sản phẩm"}
                  width={120}
                  height={120}
                  className="w-full h-auto object-cover rounded"
                  draggable={false}
                />
              </div>
              <div className="w-2/3">
                <div className="content flex flex-col gap-2">
                  <div className="name text-sm text-[#374151] pb-2 h-[2.5rem] two-line-clamp">
                    {product.name || "Sản phẩm"}
                  </div>
                  <div className="price-container flex items-center gap-2">
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