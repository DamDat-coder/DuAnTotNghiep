// src/components/Checkout/OrderItems.tsx
"use client";

import Image from "next/image";
import { ICartItem } from "@/types/cart";

interface OrderItemsProps {
  orderItems: ICartItem[];
}
const colorMap: { [key: string]: string } = {
  "#000000": "Đen",
  "#87CEEB": "Xanh da trời",
  "#FE0000": "Đỏ",
  "#FFFFFF": "Trắng",
  "#FFC0CB": "Hồng",
  "#FAD2B6": "Da",
  "#8B4513": "Nâu",
};

export default function OrderItems({ orderItems }: OrderItemsProps) {
  return (
    <div className="flex flex-col gap-4">
      {orderItems.map((item) => {
        const displayColor =
          colorMap[item.color] || item.color || "Không xác định";
        return (
          <div
            key={`${item.id}-${item.size}`}
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
            </div>
            <p className="text-sm font-bold">
              {(
                item.price *
                (1 - item.discountPercent / 100) *
                item.quantity
              ).toLocaleString("vi-VN")}
              ₫
            </p>
          </div>
        );
      })}
    </div>
  );
}
