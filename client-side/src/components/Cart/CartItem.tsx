// src/components/Cart/CartItem.tsx
import Image from "next/image";
import { Heart, Trash2 } from "lucide-react";

interface CartItemProps {
  item: {
    id: string;
    name: string;
    price: number;
    discountPercent: number;
    image: string;
    size: string;
    color: string;
    quantity: number;
    liked: boolean;
  };
  onQuantityChange: (id: string, change: number) => void;
  onToggleLike: (id: string) => void;
  onRemove: (id: string) => void;
}

export default function CartItem({
  item,
  onQuantityChange,
  onToggleLike,
  onRemove,
}: CartItemProps) {
  const discountPrice = item.price * (1 - item.discountPercent / 100);

  return (
    <div className="flex items-center gap-4 p-4">
      <Image
        src={item.image}
        alt={item.name}
        width={110}
        height={110}
        className="w-[6.9rem] h-[6.9rem] object-cover rounded"
      />
      <div className="flex-1 flex flex-col gap-2">
        <h3 className="text-lg font-semibold text-[#374151] line-clamp-2">
          {item.name}
        </h3>
        <div className="text-sm text-[#374151]">
          Size: {item.size} ({item.color})
        </div>
        <div className="text-[1rem] font-bold text-red-500">
          {discountPrice.toLocaleString("vi-VN")}₫
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
              onClick={() => onToggleLike(item.id)}
              className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200"
            >
              <Heart
                size={20}
                fill={item.liked ? "red" : "none"}
                stroke={item.liked ? "red" : "black"}
              />
            </button>
            <button
              onClick={() => onRemove(item.id)}
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