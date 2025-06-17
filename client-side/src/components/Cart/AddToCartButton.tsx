"use client";

import Image from "next/image";
import { useCartDispatch } from "@/contexts/CartContext";
import { IProduct } from "@/types/product";

interface AddToCartButtonProps {
  product: IProduct;
  quantity?: number;
  size?: string;
  color?: string;
}

export default function AddToCartButton({
  product,
  quantity = 1,
  size = product.variants[0]?.size || "M",
  color = product.variants[0]?.color || "Default",
}: AddToCartButtonProps) {
  const dispatch = useCartDispatch();

  const handleAddToCart = () => {
    // Kiểm tra size và color có trong variants
    const variant = product.variants.find(
      (v) => v.size === size && v.color === color && v.stock > 0
    );

    if (!variant) {
      alert("Kích thước hoặc màu sắc không hợp lệ hoặc đã hết hàng!");
      return;
    }

    const cartItem = {
      id: product.id,
      name: product.name,
      price: variant.discountedPrice || variant.price,
      discountPercent: variant.discountPercent,
      image: product.images[0] || "",
      quantity,
      size,
      color,
      liked: false,
    };

    dispatch({ type: "add", item: cartItem });
    alert("Đã thêm vào giỏ hàng!");
  };

  return (
    <button
      onClick={handleAddToCart}
      className="absolute top-[0.5rem] right-[0.5rem]"
      aria-label="Thêm vào giỏ hàng"
    >
      <Image
        src="/product/product_addToCart.svg"
        alt="Thêm vào giỏ hàng"
        width={30}
        height={30}
      />
    </button>
  );
}