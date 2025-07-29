"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { IProduct } from "@/types/product";
import { IWishlistItem } from "@/types/auth";

interface WishlistPopupProps {
  product: IProduct;
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: IWishlistItem) => void;
}

const colorMap: { [key: string]: string } = {
  Trắng: "#FFFFFF",
  "Xanh navy": "#000080",
  Đen: "#000000",
  Đỏ: "#FF0000",
  Xám: "#808080",
};

export default function WishlistPopup({
  product,
  isOpen,
  onClose,
  onAdd,
}: WishlistPopupProps) {
  // Lấy danh sách size và màu
  const sizes = Array.from(new Set(product.variants.map((v) => v.size))).map(
    (size) => ({
      value: size,
      inStock: product.variants.some((v) => v.size === size && v.stock > 0),
    })
  );
  const colors = Array.from(new Set(product.variants.map((v) => v.color)));

  // Tìm variant đầu tiên còn hàng
  const firstAvailableVariant = product.variants.find((v) => v.stock > 0);

  const [selectedSize, setSelectedSize] = useState(
    firstAvailableVariant?.size || ""
  );
  const [selectedColor, setSelectedColor] = useState(
    firstAvailableVariant?.color || ""
  );

  // Cập nhật lại lựa chọn khi mở popup mới
  useEffect(() => {
    if (isOpen && firstAvailableVariant) {
      setSelectedSize(firstAvailableVariant.size);
      setSelectedColor(firstAvailableVariant.color);
    }
  }, [isOpen, product.id]);

  // Lấy variant hiện tại
  const selectedVariant = product.variants.find(
    (v) => v.size === selectedSize && v.color === selectedColor
  );

  // Hiệu ứng cấm scroll khi mở popup
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isOpen]);

  // Xử lý xác nhận thêm wishlist
  const handleConfirm = () => {
    if (!selectedColor) {
      toast.error("Vui lòng chọn màu sắc!");
      return;
    }
    if (!selectedSize) {
      toast.error("Vui lòng chọn kích thước!");
      return;
    }
    if (!selectedVariant) {
      toast.error("Không tìm thấy phiên bản sản phẩm này!");
      return;
    }
    onAdd({
      id: product.id,
      name: product.name,
      image: product.images[0],
      size: selectedSize,
      color: selectedColor,
      price: selectedVariant.price,
      discountPercent: selectedVariant.discountPercent,
      discountedPrice: selectedVariant.discountedPrice,
      outOfStock: selectedVariant.stock === 0, // đánh dấu hết hàng
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[50]"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-[80%] max-w-full flex flex-col laptop:flex-row laptop:gap-8 desktop:flex-row desktop:gap-8 bg-white p-6 rounded-lg  relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Nút đóng */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 text-gray-500 hover:text-gray-700 text-xl font-bold"
              aria-label="Đóng popup"
            >
              <Image
                src="/nav/nav_clear.svg"
                alt="Add Icon"
                width={16}
                height={16}
                className="w-4 h-4"
              />
            </button>

            {/* Ảnh sản phẩm */}
            <Image
              src={product.images[0]}
              alt={product.name || "Sản phẩm"}
              width={200}
              height={200}
              className="w-auto h-[70%] object-cover rounded-md"
              draggable={false}
            />

            {/* Thông tin và chọn variant */}
            <div className="laptop:w-full laptop:flex laptop:flex-col laptop:gap-3 desktop:w-full desktop:flex desktop:flex-col desktop:gap-3">
              {/* Thông tin cơ bản */}
              <div className="flex flex-col gap-3">
                <h2 className="text-xl font-bold text-black mt-4 truncate">
                  {product.name || "Sản phẩm"}
                </h2>
                <div className="flex items-center gap-4 mt-2">
                  <p className="text-red-500 font-bold text-lg">
                    {(
                      selectedVariant?.discountedPrice ||
                      product.variants[0]?.discountedPrice ||
                      0
                    ).toLocaleString("vi-VN")}
                    ₫
                  </p>
                  {selectedVariant && selectedVariant.discountPercent > 0 && (
                    <p className="text-sm text-[#374151] line-through">
                      {selectedVariant.price.toLocaleString("vi-VN")}₫
                    </p>
                  )}
                </div>
              </div>

              {/* Chọn màu sắc */}
              <div className="">
                <label className="block text-lg font-bold text-black mb-2">
                  Màu sắc:
                </label>
                {colors.length > 0 ? (
                  <div className="flex gap-3 flex-wrap">
                    {colors.map((color) => {
                      const isSelected = selectedColor === color;
                      const tickColor = color === "Trắng" ? "black" : "white";
                      return (
                        <div
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`w-8 h-8 rounded-full cursor-pointer border-2 relative ${
                            isSelected
                              ? "border-black border-2 border-solid"
                              : "border-gray-300 border-2 border-solid"
                          }`}
                          style={{
                            backgroundColor: colorMap[color] || "#CCCCCC",
                          }}
                          aria-label={`Chọn màu ${color}`}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              setSelectedColor(color);
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
                ) : (
                  <p className="text-sm text-gray-500">
                    Không có màu sắc để chọn
                  </p>
                )}
              </div>

              {/* Chọn size */}
              <div className="">
                <label className="text-lg text-black mb-2">
                  <div className="flex w-full justify-between items-center">
                    <h3 className="font-bold">Sizes</h3>
                    {/* <div className="">
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
                    </div> */}
                  </div>
                </label>
                {sizes.length > 0 ? (
                  <div className="flex gap-3 flex-wrap">
                    {sizes.map((size) => (
                      <div
                        key={size.value}
                        onClick={() => setSelectedSize(size.value)}
                        className={`w-auto h-auto rounded-sm p-3 flex items-center justify-center border-2 cursor-pointer ${
                          selectedSize === size.value
                            ? "border-black bg-black text-white border-2 border-solid"
                            : "border-gray-300 border-2 border-solid"
                        }`}
                        aria-label={`Chọn size ${size.value}`}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            setSelectedSize(size.value);
                          }
                        }}
                      >
                        <span className="text-sm font-medium">
                          Size {size.value}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Không có size để chọn</p>
                )}
              </div>

              {/* Nút xác nhận */}
              <button
                onClick={handleConfirm}
                className="w-full bg-black text-white font-bold text-base px-3 py-3 rounded-md hover:bg-gray-800 transition-colors mt-6"
                aria-label={`Thêm sản phẩm ${product.name} vào yêu thích`}
              >
                Thêm vào yêu thích
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
