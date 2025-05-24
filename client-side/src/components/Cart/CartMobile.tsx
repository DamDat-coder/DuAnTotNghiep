"use client";

import { useRouter } from "next/navigation";
import CartItem from "./CartItem";
import { ICartItem } from "@/types/cart";

interface CartMobileProps {
  cartItems: ICartItem[];
  totalPrice: number;
  onQuantityChange: (id: string, size: string, change: number) => void;
  onToggleLike: (id: string, size: string) => void;
  onRemove: (id: string, size: string) => void;
}

export default function CartMobile({
  cartItems,
  totalPrice,
  onQuantityChange,
  onToggleLike,
  onRemove,
}: CartMobileProps) {
  const router = useRouter();

  return (
    <div className="laptop:hidden desktop:hidden">
      <div className="grid grid-cols-1 gap-6 border-b-2 border-black mt-4">
        {cartItems.map((item) => (
          <CartItem
            key={`${item.id}-${item.size}`}
            item={item}
            onQuantityChange={(id, change) => onQuantityChange(id, item.size, change)}
            onToggleLike={() => onToggleLike(item.id, item.size)}
            onRemove={() => onRemove(item.id, item.size)}
          />
        ))}
      </div>
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-[1rem] font-bold">Tổng tiền</span>
          <span className="text-[1rem] font-bold text-[#FF0000]">
            {totalPrice.toLocaleString("vi-VN")}₫
          </span>
        </div>
        <button
          onClick={() => router.push("/checkout")}
          className="w-full py-3 bg-black text-white text-[1rem] font-medium rounded-lg hover:bg-gray-800"
        >
          Thanh toán
        </button>
      </div>
    </div>
  );
}