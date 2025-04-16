// src/components/Cart/AddToCartButton.tsx
"use client";

import Image from "next/image";
import { useCartDispatch } from "@/contexts/CartContext";
import { IProduct, ICartItem } from "@/types";

interface AddToCartButtonProps {
  product: IProduct;
  quantity?: number;
  size?: string;
  color?: string;
}

export default function AddToCartButton({
  product,
  quantity = 1,
  size = "M",
  color = "Default",
}: AddToCartButtonProps) {
  const dispatch = useCartDispatch();

  const handleAddToCart = () => {
    const cartItem: ICartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      discountPercent: product.discountPercent,
      image: product.image[0],
      quantity,
      size,
      color,
      liked: false,
    };
    dispatch({ type: "add", item: cartItem });
  };

  return (
    <button onClick={handleAddToCart} className="absolute top-[0.5rem] right-[0.5rem]">
      <Image
        src="/product/product_addToCart.svg"
        alt="Thêm vào giỏ hàng"
        width={24}
        height={24}
      />
    </button>
  );
}