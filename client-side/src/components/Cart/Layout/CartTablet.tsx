"use client";

import { useRouter } from "next/navigation";
import CartItem from "./CartItem";
import { ICartItem } from "@/types/cart";
import { useCartDispatch } from "@/contexts/CartContext";

interface CartTabletProps {
  cartItems: ICartItem[];
  totalPrice: number;
  onQuantityChange: (id: string, size: string, change: number) => void;
  onToggleLike: (id: string, size: string) => void;
  onRemove: (id: string, size: string, color: string) => void;
}

export default function CartTablet({
  cartItems,
  totalPrice,
  onQuantityChange,
  onToggleLike,
  onRemove,
}: CartTabletProps) {
  const router = useRouter();
  const dispatch = useCartDispatch();

  const handleSelectItem = (id: string, size: string, selected: boolean) => {
    const item = cartItems.find((i) => i.id === id && i.size === size);
    if (!item) return;
    dispatch({
      type: "update",
      item: { ...item, selected },
    });
  };

  const selectedItems = cartItems.filter((item) => item.selected);
  const selectedItemsCount = selectedItems.length;
  const selectedTotalPrice = selectedItems.reduce(
    (sum, item) =>
      sum + item.price * (1 - item.discountPercent / 100) * item.quantity,
    0
  );

  return (
    <div className="hidden tablet:block laptop:hidden desktop:hidden">
      <div className="grid grid-cols-1 gap-6 border-b-2 border-black mt-4">
        {cartItems.map((item) => (
          <CartItem
            key={`${item.id}-${item.size}`}
            item={item}
            onQuantityChange={(id, change) =>
              onQuantityChange(id, item.size, change)
            }
            onToggleLike={() => onToggleLike(item.id, item.size)}
            onRemove={() => onRemove(item.id, item.size, item.color)}
            onSelect={(selected) =>
              handleSelectItem(item.id, item.size, selected)
            }
          />
        ))}
      </div>
      <div className="mt-8">
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-[1rem] font-bold text-[#374151]">
              {selectedItemsCount} sản phẩm
            </span>
            <span className="text-[1rem] text-[#374151] font-bold">
              {selectedTotalPrice.toLocaleString("vi-VN")}₫
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[1rem] font-bold">Tổng tiền</span>
            <span className="text-[1rem] font-bold text-[#FF0000]">
              {selectedTotalPrice.toLocaleString("vi-VN")}₫
            </span>
          </div>
        </div>
        <button
          onClick={() => router.push("/checkout")}
          className="w-full py-3 bg-black text-white text-[1rem] font-medium rounded-lg hover:bg-gray-800 mt-4"
          disabled={selectedItemsCount === 0}
        >
          Thanh toán
        </button>
      </div>
    </div>
  );
}
