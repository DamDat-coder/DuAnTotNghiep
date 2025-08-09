"use client";

import Image from "next/image";
import { ICartItem } from "@/types/cart";
import { Heart, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

interface CartItemProps {
  item: ICartItem & { stock: number };
  onQuantityChange: (id: string, change: number) => void;
  onToggleLike: () => void;
  onRemove: () => void;
  onSelect: (selected: boolean) => void;
  isDisabled?: boolean;
  isOutOfStock?: boolean;
}

export default function CartItem({
  item,
  onQuantityChange,
  onToggleLike,
  onRemove,
  onSelect,
  isDisabled = false,
  isOutOfStock = false,
}: CartItemProps) {
  console.log(item.stock);
  const maxQuantity = item.stock || 0;

  const handleQuantityChange = (change: number) => {
    const newQuantity = item.quantity + change;
    if (newQuantity > maxQuantity) {
      toast.error(`Số lượng tối đa là ${maxQuantity}!`);
      return;
    }
    if (newQuantity < 1) {
      toast.error("Số lượng phải lớn hơn 0!");
      return;
    }
    onQuantityChange(item.id, change);
  };

  return (
    <div className="flex items-center gap-4 py-4 border-b">
      <input
        type="checkbox"
        checked={item.selected}
        onChange={() => onSelect(!item.selected)}
        disabled={isDisabled}
        className={`w-5 h-5 accent-black ${
          isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
        }`}
      />

      <Image
        src={item.image}
        alt={item.name}
        width={80}
        height={80}
        className="w-20 h-20 object-cover rounded"
      />
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-[#374151]">
          {item.name}{" "}
          {isOutOfStock && (
            <span className="text-red-500">(Tạm ngưng bán)</span>
          )}
        </h3>
        <p className="text-sm text-[#374151]">
          {item.color}/{item.size}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => handleQuantityChange(-1)}
            disabled={item.quantity <= 1 || isDisabled}
            className={`w-11 h-10 border rounded flex justify-center items-center ${
              item.quantity <= 1 || isDisabled
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer hover:bg-gray-100"
            }`}
          >
            -
          </button>

          <input
            type="number"
            value={item.quantity}
            onChange={(e) => {
              const newQuantity = Number(e.target.value);
              if (isNaN(newQuantity)) return;

              if (newQuantity > maxQuantity) {
                toast.error(`Số lượng tối đa là ${maxQuantity}!`);
                return;
              }
              if (newQuantity < 1) {
                toast.error("Số lượng phải lớn hơn 0!");
                return;
              }
              onQuantityChange(item.id, newQuantity - item.quantity);
            }}
            disabled={isDisabled}
            className="w-11 h-10 text-center border rounded"
            min={1}
            max={maxQuantity}
          />

          <button
            onClick={() => handleQuantityChange(1)}
            disabled={item.quantity >= maxQuantity || isDisabled}
            className={`w-11 h-10 border rounded flex justify-center items-center ${
              item.quantity >= maxQuantity || isDisabled
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer hover:bg-gray-100"
            }`}
          >
            +
          </button>

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
              onClick={() => onRemove()}
              className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200"
            >
              <Trash2 size={20} stroke="black" />
            </button>
          </div>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold">
          {item.price.toLocaleString("vi-VN")}₫
        </p>
        {item.discountPercent > 0 && (
          <p className="text-sm text-[#374151] line-through">
            {(item.originPrice * item.quantity).toLocaleString("vi-VN")}₫
          </p>
        )}
      </div>
    </div>
  );
}
