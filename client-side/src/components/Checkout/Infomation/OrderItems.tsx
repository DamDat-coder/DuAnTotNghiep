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

        // Giá đã giảm (đã có trong cartItem)
        const discountedPrice = Math.floor(item.price * item.quantity);

        // Giá gốc
        const originalPrice = Math.floor(item.originPrice * item.quantity);

        // Tạo key cho coupon
        const itemKey = `${item.id}-${item.size}-${item.color}`;

        // Coupon discount
        const couponDiscount = applicableItemIds.includes(item.id)
          ? Math.floor(discountPerItem[itemKey] || 0)
          : 0;

        // Giá cuối
        const finalPrice = Math.max(0, discountedPrice - couponDiscount);

        console.log("DEBUG OrderItems", {
          id: item.id,
          originalPrice,
          discountedPrice,
          couponDiscount,
          finalPrice,
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
                  Giảm giá (mã {discountCode}):{" "}
                  {couponDiscount.toLocaleString("vi-VN")}₫
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm font-bold">
                {finalPrice.toLocaleString("vi-VN")}₫
              </p>
              {(item.discountPercent > 0 || couponDiscount > 0) && (
                <p className="text-sm text-[#374151] line-through">
                  {originalPrice.toLocaleString("vi-VN")}₫
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
