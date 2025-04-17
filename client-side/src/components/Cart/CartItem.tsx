"use client";

import Image from "next/image";
import { Heart, Trash2 } from "lucide-react";
import { ICartItem } from "@/types";

interface CartItemProps {
  item: ICartItem;
  onQuantityChange: (id: string, change: number) => void;
  onToggleLike: () => void;
  onRemove: () => void;
}

export default function CartItem({
  item,
  onQuantityChange,
  onToggleLike,
  onRemove,
}: CartItemProps) {
  // Dùng hình ảnh mặc định nếu item.image không hợp lệ
  const imageSrc = item.image && item.image.startsWith("/") ? item.image : "/images/placeholder.jpg";

  return (
    <div className="flex items-center gap-4 p-4">
      <Image
        src={imageSrc}
        alt={item.name}
        width={110}
        height={110}
        className="w-[6.9rem] h-[6.9rem] object-cover rounded desktop:w-[150px] desktop:h-[150px]"
      />
      <div className="flex-1 flex flex-col gap-2">
        <h3 className="text-lg font-semibold text-[#374151] line-clamp-2">
          {item.name}
        </h3>
        <div className="text-sm text-[#374151]">
          Size: {item.size} ({item.color})
        </div>
        <div className="text-[1rem] font-bold text-red-500">
          {item.price.toLocaleString("vi-VN")}₫
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 border border-gray-300 rounded-full w-fit">
            <button
              onClick={() => onQuantityChange(item.id, -1)}
              className="w-8 h-8 flex items-center justify-center text-black"
            >
              -
            </button>
            <span className="w-8 h-8 flex items-center justify-center text-black">
              {item.quantity}
            </span>
            <button
              onClick={() => onQuantityChange(item.id, 1)}
              className="w-8 h-8 flex items-center justify-center text-black"
            >
              +
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onToggleLike}
              className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200"
            >
              <Heart
                size={20}
                fill={item.liked ? "red" : "none"}
                stroke={item.liked ? "red" : "black"}
              />
            </button>
            <button
              onClick={onRemove}
              className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200"
            >
              <Trash2 size={20} stroke="black" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}