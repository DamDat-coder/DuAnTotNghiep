"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { IProduct } from "@/types/product";
import { useCartDispatch } from "@/contexts/CartContext";
import { motion, AnimatePresence } from "framer-motion";

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
  const [selectedColor, setSelectedColor] = useState<string | null>(null); // State cho màu sắc
  const [isLiked, setIsLiked] = useState(false);
  const dispatch = useCartDispatch();
  const [isSizeChartOpen, setIsSizeChartOpen] = useState<boolean>(false);

  // Dữ liệu giả lập cho màu sắc
  const mockColors = [
    { hex: "#000000", name: "Black" },
    { hex: "#87CEEB", name: "Sky Blue" },
    { hex: "#FE0000", name: "Red" },
    { hex: "#FFFFFF", name: "White" },
    { hex: "#FFC0CB", name: "Pink" },
    { hex: "#FAD2B6", name: "Peach" },
    { hex: "#8B4513", name: "Saddle Brown" },
  ];

  useEffect(() => {
    const savedLikes = JSON.parse(
      localStorage.getItem("likedProducts") || "{}"
    );
    setIsLiked(savedLikes[product.id] || false);
  }, [product.id]);

  useEffect(() => {
    const savedLikes = JSON.parse(
      localStorage.getItem("likedProducts") || "{}"
    );
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

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Vui lòng chọn size trước!");
      return;
    }
    if (!selectedColor) {
      alert("Vui lòng chọn màu sắc trước!");
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
      color: selectedColor,
      liked: isLiked,
    };

    dispatch({ type: "add", item: cartItem });
    alert("Đã thêm vào giỏ hàng!");
  };

  const toggleLike = () => {
    setIsLiked((prev) => !prev);
  };

  const handleOpenSizeChart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSizeChartOpen(true);
  };

  const handleCloseSizeChart = () => {
    setIsSizeChartOpen(false);
  };

  return (
    <>
      {/* Section 1: Sizes */}
      <div className="flex flex-col tablet:py-6 tablet:gap-6 laptop:py-16 laptop:gap-16 desktop:py-16 desktop:gap-16">
        {/* Section 2: Colors */}
        <div className="">
          <h3 className="font-semibold mb-2">Màu sắc</h3>
          <div className="flex gap-3 flex-wrap">
            {mockColors.map((color) => {
              const isSelected = selectedColor === color.hex;
              const tickColor = [
                "#FFFFFF",
                "#87CEEB",
                "#FFC0CB",
                "#FAD2B6",
              ].includes(color.hex)
                ? "black"
                : "white";
              return (
                <div
                  key={color.hex}
                  onClick={() => handleColorChange(color.hex)}
                  className={`w-8 h-8 rounded-full cursor-pointer border-2 relative ${
                    isSelected
                      ? "border-black border-2 border-solid"
                      : "border-gray-300 border-2 border-solid"
                  }`}
                  style={{ backgroundColor: color.hex }}
                  aria-label={`Chọn màu ${color.name}`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleColorChange(color.hex);
                    }
                  }}
                >
                  {isSelected && (
                    <svg
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={tickColor}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div>
          <div className="flex w-full justify-between items-center">
            <h3 className="font-semibold">Sizes</h3>
            <div className="flex justify-center items-center gap-2 ml-4">
              <button
                onClick={handleOpenSizeChart}
                className="flex justify-center items-center gap-2 ml-4"
                aria-label="Mở bảng kích thước"
              >
                <Image
                  src="/product/product_size.svg"
                  alt="Bảng size"
                  width={20}
                  height={20}
                />
                <p>Bảng size</p>
              </button>
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
          <div className="pt-3 text-red-500 text-sm font-medium">
            Còn {stock} sản phẩm
          </div>
        </div>
      </div>

      {/* Section 3: Actions */}
      <div className="flex flex-col gap-6">
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
        <div className=" flex flex-col gap-3">
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

      {/* Popup bảng kích thước */}
      <AnimatePresence>
        {isSizeChartOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]"
            onClick={handleCloseSizeChart}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-4 rounded-lg relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleCloseSizeChart}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl font-bold"
                aria-label="Đóng bảng kích thước"
              >
                <Image
                  src="/nav/nav_clear.svg"
                  alt="Close Icon"
                  width={16}
                  height={16}
                  className="w-4 h-4"
                />
              </button>
              <Image
                key="size_chart_img"
                src="/product/product_size_table.png"
                alt="Bảng kích thước"
                width={300}
                height={200}
                className="w-[40vw] h-[40vh] object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
