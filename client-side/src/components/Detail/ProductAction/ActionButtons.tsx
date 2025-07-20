"use client";

import Image from "next/image";
import { IProduct } from "@/types/product";
import { useCartDispatch } from "@/contexts/CartContext";
import WishlistButton from "../../Core/Layout/WishlistButton/WishlistButton";
import toast from "react-hot-toast";

interface ActionButtonsProps {
  product: IProduct;
  selectedSize: string | null;
  selectedColor: string | null;
  selectedVariant: IProduct["variants"][0] | undefined;
  isLiked: boolean;
  setIsLiked: (liked: boolean) => void;
}

export default function ActionButtons({
  product,
  selectedSize,
  selectedColor,
  selectedVariant,
  isLiked,
  setIsLiked,
}: ActionButtonsProps) {
  const dispatch = useCartDispatch();

  const handleAddToCart = () => {
    if (!selectedColor) {
      toast.error("Vui lòng chọn màu sắc trước!");
      return;
    }
    if (!selectedSize) {
      toast.error("Vui lòng chọn size trước!");
      return;
    }

    if (!selectedVariant || selectedVariant.stock === 0) {
      toast.error("Sản phẩm này hiện không có sẵn!");
      return;
    }

    const cartItem = {
      id: product.id,
      name: product.name,
      price: selectedVariant.discountedPrice || selectedVariant.price,
      discountPercent: selectedVariant.discountPercent,
      image: product.images[0] || "",
      quantity: 1,
      size: selectedSize,
      color: selectedColor,
      liked: isLiked,
    };

    dispatch({ type: "add", item: cartItem });
    toast.success("Đã thêm vào giỏ hàng!");
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="relative w-[95%]">
          <button
            onClick={handleAddToCart}
            className="relative z-10 bg-black text-white w-[95%] px-6 py-2 text-sm font-medium flex items-center justify-between"
          >
            <span>THÊM VÀO GIỎ HÀNG</span>
            <Image
              src="/product/product_addToCart_angle.svg"
              alt="Thêm vào giỏ hàng"
              width={20}
              height={20}
            />
          </button>
          <div className="absolute bottom-[-0.3rem] right-[1rem] bg-white border-2 border-black w-[95%] px-6 py-2 text-sm font-medium flex items-center justify-between z-0">
            <span>THÊM VÀO GIỎ HÀNG</span>
            <Image
              src="/product/product_addToCart_angle.svg"
              alt="Thêm vào giỏ hàng"
              width={20}
              height={20}
            />
          </div>
        </div>
        <div className="z-40 w-11 h-11 border-2 border-solid border-black flex justify-center items-center">
          <WishlistButton product={product} variant="black" />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Image
            src="/product/product_section3_delivery.svg"
            alt="Free shipping"
            width={20}
            height={20}
          />
          <span className="text-sm">Free ship khi đơn hàng trên 1 triệu</span>
        </div>
        <div className="flex items-center gap-2">
          <Image
            src="/product/product_section3_swap.svg"
            alt="Easy return"
            width={20}
            height={20}
          />
          <span className="text-sm">Đổi trả hàng dễ dàng</span>
        </div>
      </div>
    </div>
  );
}