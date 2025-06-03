// src/components/Checkout/OrderItems.tsx
"use client";

import Image from "next/image";
import { ICartItem } from "@/types/cart";

interface OrderItemsProps {
  orderItems: ICartItem[];
}

export default function OrderItems({ orderItems }: OrderItemsProps) {
  return (
    <div className="flex flex-col gap-4">
      {orderItems.map((item) => {
        // Xử lý URL ảnh tương tự CartItem.tsx
        const imageSrc = item.image
          ? item.image.startsWith("/")
            ? item.image
            : "/product/img/" + item.image
          : "/images/placeholder.jpg";

        return (
          <div
            key={`${item.id}-${item.size}`}
            className="flex items-center gap-4 p-4 border-b"
          >
            <Image
              src={imageSrc}
              alt={item.name}
              width={110}
              height={110}
              className="w-[6.9rem] h-[6.9rem] object-cover rounded"
            />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[#374151]">{item.name}</h3>
              <p className="text-sm text-[#374151]">
                Size: {item.size} ({item.color})
              </p>
              <p className="text-sm text-[#374151]">Số lượng: {item.quantity}</p>
              <p className="text-[1rem] font-bold text-red-500">
                {(item.price * (1 - item.discountPercent / 100) * item.quantity).toLocaleString(
                  "vi-VN"
                )}₫
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}