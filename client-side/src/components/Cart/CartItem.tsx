"use client";

import Image from "next/image";
import { Heart, Trash2 } from "lucide-react";
import { ICartItem } from "@/types/cart";

// Ánh xạ mã màu sang tên màu
const colorMap: { [key: string]: string } = {
  "#000000": "Đen",
  "#87CEEB": "Xanh da trời",
  "#FE0000": "Đỏ",
  "#FFFFFF": "Trắng",
  "#FFC0CB": "Hồng",
  "#FAD2B6": "Da",
  "#8B4513": "Nâu",
};

interface CartItemProps {
  item: ICartItem;
  onQuantityChange: (id: string, change: number) => void;
  onToggleLike: () => void;
  onRemove: () => void;
  onSelect?: (selected: boolean) => void;
}

export default function CartItem({
  item,
  onQuantityChange,
  onToggleLike,
  onRemove,
  onSelect,
}: CartItemProps) {

  // Lấy tên màu từ colorMap, mặc định là item.color nếu không tìm thấy
  const displayColor = colorMap[item.color] || item.color || "Không xác định";

  return (
    <>
      <div className="block tablet:hidden laptop:hidden desktop:hidden">
        <div className="flex items-center gap-2 py-0 px-2">
          {/* Checkbox */}
          <input
            type="checkbox"
            checked={item.selected ?? false}
            onChange={(e) => onSelect?.(e.target.checked)}
            className="w-5 h-5 accent-black"
          />

          <Image
            src={item.image}
            alt={item.image}
            width={110}
            height={110}
            className="w-[6.9rem] h-[6.9rem] object-cover rounded desktop:w-[150px] desktop:h-[150px]"
          />

          <div className="flex-1 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-[#374151] line-clamp-2">
                {item.name}
              </h3>
              <div className="text-[1rem] font-bold text-red-500">
                {(item.price * (1 - item.discountPercent / 100)).toLocaleString(
                  "vi-VN"
                )}
                ₫
              </div>
            </div>
            <div className="text-sm text-[#374151]">
              {item.size}/({displayColor})
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
      </div>
      <div className="hidden tablet:block laptop:block desktop:block">
        <div className="flex items-center gap-4 py-0 px-2">
          {/* Checkbox */}
          <input
            type="checkbox"
            checked={item.selected ?? false}
            onChange={(e) => onSelect?.(e.target.checked)}
            className="w-5 h-5 accent-black"
          />

          <Image
            src={item.image}
            alt={item.image}
            width={110}
            height={110}
            className="w-[6.9rem] h-[6.9rem] object-cover rounded desktop:w-[150px] desktop:h-[150px]"
          />

          <div className="flex-1 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-[#374151] line-clamp-2">
                {item.name}
              </h3>
              <div className="text-[1rem] font-bold text-red-500">
                {(item.price * (1 - item.discountPercent / 100)).toLocaleString(
                  "vi-VN"
                )}
                ₫
              </div>
            </div>
            <div className="text-sm text-[#374151]">
              {displayColor}/{item.size}
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
      </div>
    </>
  );
}
