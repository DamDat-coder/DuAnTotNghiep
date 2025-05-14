"use client";

import Image from "next/image";
import { useCartDispatch } from "@/contexts/CartContext";
import { IProduct } from "@/types";

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
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price * (1 - product.discountPercent / 100),
      discountPercent: product.discountPercent,
      image: `/product/img/${product.images[0]}`,
      quantity,
      size,
      color,
      liked: false,
    };
    dispatch({ type: "add", item: cartItem });
    alert("Đã thêm vào giỏ hàng!");
  };

  return (
    <button onClick={handleAddToCart} className="absolute top-[0.5rem] right-[0.5rem]">
      <Image
        src="/product/product_addToCart.svg"
        alt="Thêm vào giỏ hàng"
        width={30}
        height={30}
      />
    </button>
  );
}