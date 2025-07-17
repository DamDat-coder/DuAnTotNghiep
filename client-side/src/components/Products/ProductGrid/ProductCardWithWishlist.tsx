"use client";

import Image from "next/image";
import Link from "next/link";
import { IProduct } from "@/types/product";
import { getLowestPriceVariant } from "@/utils/product";
import WishlistButton from "@/components/Core/Layout/WishlistButton/WishlistButton";

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
        <Image
          src={product.images[0]}
          alt={product.name || "Sản phẩm"}
          width={363}
          height={363}
          className="w-full h-[16.8125rem] laptop:h-[18.3125rem] desktop:h-[24.0625rem] object-cover"
          draggable={false}
        />

        {/* Hiển thị tag giảm giá nếu có */}
        {discountPercent > 0 && (
          <div className="absolute top-[0.5rem] left-[0.5rem] bg-red-500 text-white text-[0.75rem] font-bold px-2 py-1 rounded">
            -{discountPercent}%
          </div>
        )}

        {/* Wishlist button */}
        <div className="absolute top-[0.5rem] right-[0.5rem] w-8 h-8 rounded-full flex justify-center items-center cursor-pointer bg-[#D9D9D9]">
          <WishlistButton product={product} variant="white" borderColor="white" />
        </div>

        {/* Thông tin sản phẩm */}
        <div className="content flex flex-col py-4 gap-3">
          <div>
            <div className="name text-base tablet:text-lg font-bold text-[#374151] pb-2 two-line-clamp h-[3.5rem]">
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
          <div className="flex gap-3 font-heading">
            <Link
              href={`/products/${product.id}`}
              className="p-3 border-solid border-black border-2 rounded text-base"
            >
              Xem chi tiết
            </Link>
            <button
              onClick={(e) => onBuyNow(product, e)}
              className="p-3 border-solid border-black border-2 rounded text-white bg-black font-bold text-base"
              aria-label={`Mua ngay sản phẩm ${product.name}`}
            >
              Mua ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
