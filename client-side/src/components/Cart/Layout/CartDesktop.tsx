"use client";

import CartItem from "./CartItem";
import { CartProps, ICartItem } from "@/types/cart";
import { useCartDispatch } from "@/contexts/CartContext";
import toast from "react-hot-toast";

export default function CartDesktop({
  cartItems,
  totalPrice,
  onQuantityChange,
  onToggleLike,
  onRemove,
  productsActiveStatus,
}: CartProps) {
  const dispatch = useCartDispatch();

  const handleSelectItem = (id: string, size: string, selected: boolean) => {
    const item = cartItems.find((i) => i.id === id && i.size === size);
    if (!item || productsActiveStatus[item.id] === false) return;
    dispatch({
      type: "update",
      item: { ...item, selected },
    });
  };

  const selectedItems = cartItems.filter(
    (item) => item.selected && productsActiveStatus[item.id] !== false
  );
  const selectedItemsCount = selectedItems.length;
  const selectedTotalPrice = selectedItems.reduce(
    (sum, item) =>
      sum + item.price * (1 - item.discountPercent / 100) * item.quantity,
    0
  );
  const selectedDiscount = selectedItems.reduce(
    (sum, item) =>
      sum + item.price * (item.discountPercent / 100) * item.quantity,
    0
  );

  const checkSelect = () => {
    if (selectedItemsCount === 0) {
      toast.error("Vui lòng chọn ít nhất một sản phẩm để đặt hàng!");
      return;
    }

    const accessToken =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;

    if (!accessToken) {
      toast.error("Bạn vui lòng đăng nhập trước khi đặt hàng!");
      return;
    }

     window.location.href = "/checkout";
  };

  return (
    <div className="hidden tablet:hidden desktop:flex desktop:gap-6 laptop:flex laptop:gap-6 mt-4">
      <div className="w-[70%]">
        <div className="grid grid-cols-1 gap-6 border-b-2 border-black">
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
              isDisabled={productsActiveStatus[item.id] === false}
              isOutOfStock={productsActiveStatus[item.id] === false}
            />
          ))}
        </div>
      </div>
      <div className="w-[25%] absolute top-0 right-0">
        <h2 className="text-xl font-semibold mb-4">Tóm tắt</h2>
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
            <span className="text-[1rem] text-[#374151] font-bold">
              Giá trước khi giảm
            </span>
            <span className="text-[1rem] text-[#374151] font-bold">
              {(selectedTotalPrice + selectedDiscount).toLocaleString("vi-VN")}₫
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[1rem] font-bold text-[#999999]">
              Đã giảm giá
            </span>
            <span className="text-[1rem] text-[#999999]">
              {selectedDiscount.toLocaleString("vi-VN")}₫
            </span>
          </div>
          <div className="flex justify-between items-center border-t-2 border-black border-solid pt-3 mt-3">
            <span className="text-[1rem] font-bold">Tổng tiền</span>
            <span className="text-[1rem] font-bold text-[#FF0000]">
              {selectedTotalPrice.toLocaleString("vi-VN")}₫
            </span>
          </div>
        </div>
        <button
          onClick={checkSelect}
          className="w-full py-3 bg-black text-white text-[1rem] font-medium rounded-lg hover:bg-gray-800 mt-4"
          disabled={selectedItemsCount === 0}
        >
          Đặt hàng
        </button>
      </div>
    </div>
  );
}
