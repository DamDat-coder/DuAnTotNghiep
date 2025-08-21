"use client";

import Image from "next/image";
import Link from "next/link";
import { IProduct } from "@/types/product";
import { getLowestPriceVariant } from "@/utils/product";
import WishlistButton from "@/components/Core/Layout/WishlistButton/WishlistButton";
import { ShoppingCartIcon } from "lucide-react";

type Props = {
  product: IProduct;
  onBuyNow: (product: IProduct, e: React.MouseEvent) => void;
};

export default function ProductCardWithWishlist({ product, onBuyNow }: Props) {
  // Tính giá thấp nhất + phần trăm giảm giá
  const { price, discountPercent } = getLowestPriceVariant(product);
  const discountedPrice = Math.round(price * (1 - discountPercent / 100));

  return (
    <div className="w-full flex flex-col bg-white relative">
      <div className="product w-full h-auto font-description">
        {/* Ảnh sản phẩm */}
        <div className="relative">
          {/* Lớp phủ nền đen nếu hết hàng */}
          {product.variants.every((v) => Number(v.stock) === 0) && (
            <div className="absolute inset-0 bg-black/80 rounded-xl z-10"></div>
          )}
          {/* Ảnh sản phẩm */}
          <Image
            src={product.images[0] || "/no-image.png"}
            alt={product.name}
            width={300}
            height={300}
            className={`object-cover w-full h-[300px] rounded-xl transition-all duration-300 ${
              product.variants.every((v) => Number(v.stock) === 0)
                ? "opacity-40 blur-[2px]"
                : ""
            }`}
            draggable={false}
          />
          {/* Dòng chữ hết hàng nằm chéo */}
          {product.variants.every((v) => Number(v.stock) === 0) && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl pointer-events-none z-20">
              <span
                className="text-white font-heading text-[32px] font-bold px-6 py-3 rounded-xl select-none"
                style={{
                  transform: "rotate(-45deg)",
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  translate: "-50% -50%",
                  whiteSpace: "nowrap",
                }}
              >
                Sản phẩm hết hàng
              </span>
            </div>
          )}
        </div>

        {/* Hiển thị tag giảm giá nếu có */}
        {discountPercent > 0 && (
          <div className="absolute top-[0.5rem] left-[0.5rem] bg-red-500 text-white text-[0.75rem] font-bold px-2 py-1 rounded">
            -{discountPercent}%
          </div>
        )}

        {/* Wishlist button */}
        <div className="absolute top-[0.5rem] right-[0.5rem] w-8 h-8 rounded-full flex justify-center items-center cursor-pointer bg-[#D9D9D9]">
          <WishlistButton
            product={product}
            variant="white"
            borderColor="white"
          />
        </div>

        {/* Thông tin sản phẩm */}
        <div className="content flex flex-col py-4 gap-3">
          <div>
            <div className="name text-base tablet:text-lg font-bold text-[#374151] pb-2 two-line-clamp h-[3.2rem] tablet:h-[3.8rem]">
              {product.name || "Sản phẩm"}
            </div>
            <div className="category text-base text-[#374151] truncate">
              {product.category?.name || "Danh mục"}
            </div>
          </div>

          {/* Giá sau giảm + giá gốc nếu có */}
          <div className="price-container flex items-center gap-3">
            <div className="discountedPrice text-[1rem] font-bold text-red-500">
              {discountedPrice.toLocaleString("vi-VN")}₫
            </div>
            {discountPercent > 0 && (
              <div className="price text-[0.875rem] text-[#374151] line-through">
                {price.toLocaleString("vi-VN")}₫
              </div>
            )}
          </div>

          {/* Nút hành động: xem chi tiết & mua ngay */}
          <div className="flex gap-3 font-heading flex-col-reverse tablet:flex-row">
            <Link
              href={`/products/${product.id}`}
              className="flex items-center justify-center p-2 border border-black border-solid rounded text-sm laptop:text-base desktop:text-base"
            >
              Xem chi tiết
            </Link>
            <button
              onClick={(e) => onBuyNow(product, e)}
              className="flex items-center justify-center gap-1 px-3 py-2 laptop:px-4 laptop:py-3 border border-black bg-black text-white rounded font-bold text-sm laptop:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={product.variants.every((v) => Number(v.stock) === 0)}
            >
              <ShoppingCartIcon className="w-4 h-4 laptop:hidden desktop:hidden" />
              <span className="hidden tablet:inline laptop:inline desktop:inline">
                Mua ngay
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
