"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { IProduct } from "@/types/product";
import { useCartDispatch } from "@/contexts/CartContext";

interface ProductActionsProps {
  product: IProduct;
  sizes: { value: string; inStock: boolean }[];
  stock: number;
  discountedPrice: number;
}

export default function ProductActions({
  product,
  sizes,
  stock,
  discountedPrice,
}: ProductActionsProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>("XL");
  const [isLiked, setIsLiked] = useState(false);
  const dispatch = useCartDispatch();

  useEffect(() => {
    const savedLikes = JSON.parse(localStorage.getItem("likedProducts") || "{}");
    setIsLiked(savedLikes[product.id] || false);
  }, [product.id]);

  useEffect(() => {
    const savedLikes = JSON.parse(localStorage.getItem("likedProducts") || "{}");
    localStorage.setItem(
      "likedProducts",
      JSON.stringify({ ...savedLikes, [product.id]: isLiked })
    );
  }, [isLiked, product.id]);

  const handleSizeChange = (size: string) => {
    if (sizes.find((s) => s.value === size)?.inStock) {
      setSelectedSize(size);
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Vui lòng chọn size trước!");
      return;
    }

    const cartItem = {
      id: product.id,
      name: product.name,
      price: discountedPrice,
      discountPercent: product.discountPercent,
      image: typeof product.images[0] === "string" ? product.images[0] : "",
      quantity: 1,
      size: selectedSize,
      color: "Default",
      liked: isLiked,
    };

    dispatch({ type: "add", item: cartItem });
    alert("Đã thêm vào giỏ hàng!");
  };

  const toggleLike = () => {
    setIsLiked((prev) => !prev);
  };

  return (
    <>
      {/* Section 2: Sizes */}
      <div>
        <div className="flex w-full justify-between items-center">
          <h3 className="font-semibold">Sizes</h3>
          <div className="flex justify-center items-center gap-2 ml-4">
            <Image src="/product/product_size.svg" alt="Bảng size" width={20} height={20} />
            <p>Bảng size</p>
          </div>
        </div>
        <div className="pt-3 flex flex-wrap gap-2 mt-2">
          {sizes.map((size) => (
            <button
              key={size.value}
              onClick={() => handleSizeChange(size.value)}
              className={`px-4 py-2 border rounded-sm text-sm font-medium ${
                selectedSize === size.value && size.inStock
                  ? "bg-black text-white"
                  : !size.inStock
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "hover:bg-gray-100"
              }`}
              disabled={!size.inStock}
            >
              Size {size.value}
            </button>
          ))}
        </div>
        <div className="pt-3 laptop:pb-16 desktop:pb-16 text-red-500 text-sm font-medium">Còn {stock} sản phẩm</div>
      </div>

      {/* Section 3: Actions */}
      <div>
        <div className="flex items-center justify-between">
          <div className="relative w-full">
            <button
              onClick={handleAddToCart}
              className="relative z-10 bg-black text-white w-full px-6 py-2 text-sm font-medium flex items-center justify-between"
            >
              <span>THÊM VÀO GIỎ HÀNG</span>
              <Image
                src="/product/product_addToCart_angle.svg"
                alt="Thêm vào giỏ hàng"
                width={20}
                height={20}
              />
            </button>
            <div className="absolute bottom-[-0.3rem] right-[-0.3rem] bg-white border-2 border-black border-solid w-full px-6 py-2 text-sm font-medium flex items-center justify-between z-0">
              <span>THÊM VÀO GIỎ HÀNG</span>
              <Image
                src="/product/product_addToCart_angle.svg"
                alt="Thêm vào giỏ hàng"
                width={20}
                height={20}
              />
            </div>
          </div>
          <button onClick={toggleLike} className="mt-1 ml-4">
            <Image
              src={
                isLiked
                  ? "/product/product_like_active.svg"
                  : "/product/product_like_square.svg"
              }
              alt={isLiked ? "Đã thích" : "Thích"}
              width={45}
              height={45}
            />
          </button>
        </div>
        <div className="mt-4 flex flex-col gap-3">
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
    </>
  );
}