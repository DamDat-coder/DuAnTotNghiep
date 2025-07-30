"use client";

import { CartProps, ICartItem } from "@/types/cart";
import CartItem from "./CartItem";
import { useCartDispatch } from "@/contexts/CartContext";
import toast from "react-hot-toast";

export default function CartMobile({
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

  return (
    <div className="mobile:block tablet:block laptop:hidden desktop:hidden">
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
      <div className="mt-4">
        <p>Tổng tiền: {totalPrice.toLocaleString("vi-VN")}₫</p>
      </div>
    </div>
  );
}
