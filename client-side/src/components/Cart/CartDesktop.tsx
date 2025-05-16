"use client";

import { useRouter } from "next/navigation";
import CartItem from "./CartItem";
import { ICartItem } from "@/types";

interface CartDesktopProps {
  cartItems: ICartItem[];
  totalPrice: number;
  onQuantityChange: (id: string, size: string, change: number) => void;
  onToggleLike: (id: string, size: string) => void;
  onRemove: (id: string, size: string) => void;
}

export default function CartDesktop({
  cartItems,
  totalPrice,
  onQuantityChange,
  onToggleLike,
  onRemove,
}: CartDesktopProps) {
  const router = useRouter();

  return (
    <div className="hidden desktop:flex desktop:gap-6 laptop:flex laptop:gap-6 mt-4">
      {/* Container trái (80%) - Giỏ hàng */}
      <div className="w-[80%]">
        <div className="grid grid-cols-1 gap-6 border-b-2 border-black">
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
      </div>

      {/* Container phải (20%) - Tóm tắt */}
      <div className="w-[25%]">
        <h2 className="text-xl font-semibold mb-4">Tóm tắt</h2>
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-[1rem] font-bold text-[#374151]">
              {cartItems.length} sản phẩm
            </span>
            <span className="text-[1rem] text-[#374151] font-bold">
              {cartItems
                .reduce((total, item) => total + item.price * item.quantity, 0)
                .toLocaleString("vi-VN")}₫
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[1rem] text-[#374151] font-bold">
              Giá trước khi giảm
            </span>
            <span className="text-[1rem] text-[#374151] font-bold">
              {cartItems
                .reduce((total, item) => total + item.price * item.quantity, 0)
                .toLocaleString("vi-VN")}₫
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[1rem] font-bold text-[#999999]">
              Đã giảm giá
            </span>
            <span className="text-[1rem] text-[#999999]">
              {cartItems
                .reduce(
                  (total, item) =>
                    total +
                    (item.price * (item.discountPercent / 100)) * item.quantity,
                  0
                )
                .toLocaleString("vi-VN")}₫
            </span>
          </div>
          <div className="flex justify-between items-center border-t-2 border-black border-solid pt-3 mt-3">
            <span className="text-[1rem] font-bold">Tổng tiền</span>
            <span className="text-[1rem] font-bold text-[#FF0000]">
              {totalPrice.toLocaleString("vi-VN")}₫
            </span>
          </div>
        </div>
        <button
          onClick={() => router.push("/checkout")}
          className="w-full py-3 bg-black text-white text-[1rem] font-medium rounded-lg hover:bg-gray-800 mt-4"
        >
          Thanh toán
        </button>
      </div>
    </div>
  );
}