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
}

export default function ProductActions({
  product,
  sizes,
  stock,
}: ProductActionsProps) {
  // Khởi tạo với variant đầu tiên
  const firstVariant = product.variants[0];
  const [selectedSize, setSelectedSize] = useState<string | null>(
    firstVariant?.size || null
  );
  const [selectedColor, setSelectedColor] = useState<string | null>(
    firstVariant?.color || null
  );
  const [isLiked, setIsLiked] = useState(false);
  const dispatch = useCartDispatch();
  const [isSizeChartOpen, setIsSizeChartOpen] = useState<boolean>(false);
  const [selectedVariant, setSelectedVariant] = useState<{
    price: number;
    discountedPrice?: number;
    discountPercent: number;
  } | null>(
    firstVariant
      ? {
          price: firstVariant.price,
          discountedPrice: firstVariant.discountedPrice || firstVariant.price,
          discountPercent: firstVariant.discountPercent,
        }
      : null
  );

  // Lấy danh sách màu sắc từ variants
  const colors = Array.from(new Set(product.variants.map((v) => v.color))).map(
    (color) => ({
      name: color,
      hex:
        color === "Xám"
          ? "#808080"
          : color === "Đen"
          ? "#000000"
          : color === "Đỏ"
          ? "#FF0000"
          : "#FFFFFF",
    })
  );

  // Lấy danh sách kích thước khả dụng dựa trên màu sắc đã chọn
  const availableSizes = selectedColor
    ? product.variants
        .filter((v) => v.color === selectedColor && v.stock > 0)
        .map((v) => v.size)
    : sizes.map((s) => s.value);

  // Cập nhật giá tiền khi chọn màu và kích thước
  useEffect(() => {
    if (selectedColor && selectedSize) {
      const variant = product.variants.find(
        (v) => v.color === selectedColor && v.size === selectedSize
      );
      if (variant) {
        setSelectedVariant({
          price: variant.price,
          discountedPrice: variant.discountedPrice || variant.price,
          discountPercent: variant.discountPercent,
        });
      } else {
        setSelectedVariant(null);
      }
    } else {
      // Nếu chưa chọn đủ màu và kích thước, giữ variant đầu tiên
      const lowestVariant = product.variants[0];
      setSelectedVariant({
        price: lowestVariant.price,
        discountedPrice: lowestVariant.discountedPrice || lowestVariant.price,
        discountPercent: lowestVariant.discountPercent,
      });
    }
  }, [selectedColor, selectedSize, product.variants]);

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

  useEffect(() => {
    if (isSizeChartOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isSizeChartOpen]);

  const handleSizeChange = (size: string) => {
    if (
      sizes.find((s) => s.value === size)?.inStock &&
      (!selectedColor || availableSizes.includes(size))
    ) {
      setSelectedSize(size);
    }
  };

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    if (selectedSize && !availableSizes.includes(selectedSize)) {
      setSelectedSize(null);
    }
  };

  const handleAddToCart = () => {
    if (!selectedColor) {
      alert("Vui lòng chọn màu sắc trước!");
      return;
    }
    if (!selectedSize) {
      alert("Vui lòng chọn size trước!");
      return;
    }

    const variant = product.variants.find(
      (v) => v.size === selectedSize && v.color === selectedColor
    );
    if (!variant || variant.stock === 0) {
      alert("Sản phẩm này hiện không có sẵn!");
      return;
    }

    const cartItem = {
      id: product.id,
      name: product.name,
      price: variant.discountedPrice || variant.price,
      discountPercent: variant.discountPercent,
      image: product.images[0] || "",
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
      <div className="flex flex-col gap-9 tablet:py-6 laptop:py-8 laptop:gap-py-8 desktop:py-8 desktop:gap-py-8">
        {/* Giá tiền động */}
        {selectedVariant && (
          <div className="flex items-center gap-4">
            <div className="text-red-500 font-bold text-lg">
              {(
                selectedVariant.discountedPrice || selectedVariant.price
              ).toLocaleString("vi-VN")}
              ₫
            </div>
            <div
              className={`text-sm text-gray-500 line-through ${
                !selectedVariant.discountPercent ? "hidden" : "block"
              }`}
            >
              {selectedVariant.price.toLocaleString("vi-VN")}₫
            </div>
          </div>
        )}

        {/* Section 2: Colors */}
        <div>
          <h3 className="font-semibold mb-2">Màu sắc</h3>
          <div className="flex gap-3 flex-wrap">
            {colors.map((color) => {
              const isSelected = selectedColor === color.name;
              const tickColor = color.hex === "#FFFFFF" ? "black" : "white";
              return (
                <div
                  key={color.name}
                  onClick={() => handleColorChange(color.name)}
                  className={`w-8 h-8 rounded-full cursor-pointer border-2 relative `}
                  style={{ backgroundColor: color.hex }}
                  aria-label={`Chọn màu ${color.name}`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleColorChange(color.name);
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
            {sizes.map((size) => {
              const isAvailable =
                !selectedColor || availableSizes.includes(size.value);
              return (
                <button
                  key={size.value}
                  onClick={() => handleSizeChange(size.value)}
                  className={`px-4 py-2 border rounded-sm text-sm font-medium ${
                    selectedSize === size.value && isAvailable
                      ? "bg-black text-white"
                      : !isAvailable || !size.inStock
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed opacity-50"
                      : "hover:bg-gray-100"
                  }`}
                  disabled={!isAvailable || !size.inStock}
                >
                  Size {size.value}
                </button>
              );
            })}
          </div>
          <div className="pt-3 text-red-500 text-sm font-medium">
            Còn {stock} sản phẩm
          </div>
        </div>
      </div>

      {/* Section 3: Actions */}
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
            <div className="absolute bottom-[-0.3rem] right-[1rem] bg-white border-2 border-black border-solid w-[95%] px-6 py-2 text-sm font-medium flex items-center justify-between z-0">
              <span>THÊM VÀO GIỎ HÀNG</span>
              <Image
                src="/product/product_addToCart_angle.svg"
                alt="Thêm vào giỏ hàng"
                width={20}
                height={20}
              />
            </div>
          </div>
          <button
            onClick={toggleLike}
            className="w-11 h-11 border-2 border-solid border-black flex justify-center items-center"
          >
            <Image
              src={
                isLiked
                  ? "/product/product_like_active_detail.svg"
                  : "/product/product_like_detail.svg"
              }
              alt={isLiked ? "Đã thích" : "Thích"}
              width={30}
              height={30}
              className="w-4 h-4"
            />
          </button>
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

      {/* Popup bảng kích thước */}
      <AnimatePresence>
        {isSizeChartOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
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
