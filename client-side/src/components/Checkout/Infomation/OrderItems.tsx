"use client";

import Image from "next/image";
import { ICartItem } from "@/types/cart";

interface OrderItemsProps {
  orderItems: ICartItem[];
  applicableItemIds?: string[];
  discountPerItem?: { [itemKey: string]: number };
  discountCode?: string;
}

const colorMap: { [key: string]: string } = {
  "#000000": "Đen",
  "#87CEEB": "Xanh da trời",
  "#FE0000": "Đỏ",
  "#FFFFFF": "Trắng",
  "#FFC0CB": "Hồng",
  "#FAD2B6": "Da",
  "#8B4513": "Nâu",
  Xám: "Xám",
};

export default function OrderItems({
  orderItems,
  applicableItemIds = [],
  discountPerItem = {},
  discountCode = "",
}: OrderItemsProps) {
  return (
    <div className="flex flex-col gap-4">
      {orderItems.map((item) => {
        const displayColor =
          colorMap[item.color] || item.color || "Không xác định";
        // Giá sau khi áp discountPercent, làm tròn xuống
        const discountedPrice = Math.floor(
          item.price * (1 - item.discountPercent / 100) * item.quantity
        );
        // Giá gốc
        const originalPrice = item.price * item.quantity;
        // Tạo itemKey
        const itemKey = `${item.id}-${item.size}-${item.color}`;
        // Kiểm tra couponDiscount
        const couponDiscount = applicableItemIds.includes(item.id)
          ? Math.floor(discountPerItem[itemKey] || 0)
          : 0;
        // Giá cuối, làm tròn xuống
        const finalPrice = Math.floor(discountedPrice - couponDiscount);

        // Debug log chi tiết
        console.log("DEBUG OrderItems - Item", {
          itemId: item.id,
          itemKey,
          size: item.size,
          color: item.color,
          originalPrice,
          discountedPrice,
          couponDiscount,
          finalPrice,
          applicableItemIds,
          discountPerItem,
        });

        return (
          <div
            key={`${item.id}-${item.size}-${item.color}`}
            className="flex items-center gap-4 py-4 border-b"
          >
            <Image
              src={item.image}
              alt={item.name}
              width={110}
              height={110}
              className="w-[4.875rem] h-[4.875rem] object-cover rounded"
            />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-[#374151]">
                {item.name}
              </h3>
              <div className="flex items-center gap-4">
                <p className="text-sm text-[#374151]">
                  {displayColor}/{item.size}
                </p>
                <p className="text-sm text-[#374151]">Sl: {item.quantity}</p>
              </div>
              {couponDiscount > 0 && discountCode && (
                <p className="text-sm text-gray-400 mt-1">
                  Giảm giá (mã {discountCode}): {couponDiscount.toLocaleString("vi-VN", { maximumFractionDigits: 0 })}₫
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm font-bold">
                {finalPrice.toLocaleString("vi-VN", { maximumFractionDigits: 0 })}₫
              </p>
              {(item.discountPercent > 0 || couponDiscount > 0) && (
                <p className="text-sm text-[#374151] line-through">
                  {originalPrice.toLocaleString("vi-VN", { maximumFractionDigits: 0 })}₫
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}