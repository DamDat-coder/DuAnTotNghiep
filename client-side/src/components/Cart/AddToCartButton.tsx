"use client";

import Image from "next/image";

interface AddToCartButtonProps {
  onClick: (e: React.MouseEvent) => void;
}

export default function AddToCartButton({ onClick }: AddToCartButtonProps) {
  return (
    <button
      onClick={onClick}
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
