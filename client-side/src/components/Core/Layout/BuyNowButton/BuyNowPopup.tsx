"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { IProduct } from "@/types/product";
import { useCartDispatch } from "@/contexts/CartContext";
import { useSearchParams } from "next/navigation";

interface BuyNowPopupProps {
  product: IProduct;
  isOpen: boolean;
  onClose: () => void;
}

const BuyNowPopup = ({ product, isOpen, onClose }: BuyNowPopupProps) => {
  const router = useRouter();
  const dispatch = useCartDispatch();
  // Tìm variant đầu tiên có stock > 0
  const firstAvailableVariant = product.variants.find((v) => v.stock > 0);

  const [selectedSize, setSelectedSize] = useState(
    firstAvailableVariant?.size || ""
  );
  const [selectedColor, setSelectedColor] = useState(
    firstAvailableVariant?.color || ""
  );
  const [quantity, setQuantity] = useState(1);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);

  const searchParams = useSearchParams();
  const couponId = searchParams.get("coupon");
  const [applyCoupon, setApplyCoupon] = useState(!!couponId);

  // Ngăn scroll khi popup hoặc bảng kích thước mở
  useEffect(() => {
    if (isOpen || isSizeChartOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isOpen, isSizeChartOpen]);

  // Lấy danh sách kích thước và màu sắc từ variants
  const sizes = Array.from(new Set(product.variants.map((v) => v.size))).map(
    (size) => ({
      value: size,
      inStock: product.variants.some((v) => v.size === size && v.stock > 0),
    })
  );

  const colors = Array.from(new Set(product.variants.map((v) => v.color)));

  // Ánh xạ màu sắc
  const colorMap: { [key: string]: string } = {
    Trắng: "#FFFFFF",
    "Xanh navy": "#000080",
    Đen: "#000000",
    Đỏ: "#FF0000",
    Xám: "#808080",
  };

  // Lấy variant hiện tại
  const selectedVariant = product.variants.find(
    (v) => v.size === selectedSize && v.color === selectedColor
  );

  // Giới hạn số lượng dựa trên stock
  const maxQuantity = selectedVariant ? selectedVariant.stock : 0;

  useEffect(() => {
    if (quantity > maxQuantity) {
      setQuantity(Math.max(1, maxQuantity));
    }
  }, [maxQuantity, quantity]);

  // Xử lý xác nhận mua ngay
  const handleConfirm = () => {
    const accessToken =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;
    if (!accessToken) {
      toast.error("Bạn vui lòng đăng nhập trước khi mua hàng!");
      return;
    }
    if (!selectedColor) {
      toast.error("Vui lòng chọn màu sắc!");
      return;
    }
    if (!selectedSize) {
      toast.error("Vui lòng chọn kích thước!");
      return;
    }
    if (quantity < 1) {
      toast.error("Số lượng phải lớn hơn 0!");
      return;
    }
    if (!selectedVariant || selectedVariant.stock < quantity) {
      toast.error("Sản phẩm không đủ hàng!");
      return;
    }

    dispatch({ type: "resetSelected" });

    // Tạo cartItem
    const cartItem = {
      id: product.id,
      name: product.name,
      price: selectedVariant.discountedPrice,
      discountPercent: selectedVariant.discountPercent,
      image: product.images[0] || "",
      quantity,
      size: selectedSize,
      color: selectedColor,
      liked: false,
      selected: true,
    };
    if (applyCoupon && couponId) {
      localStorage.setItem("pendingCouponCode", couponId);
    }
    // Thêm vào giỏ hàng
    dispatch({ type: "add", item: cartItem });
    const selectedId = `${product.id}-${selectedSize}-${selectedColor}`;

    toast.success("Đã thêm vào giỏ hàng!");

    // Chuyển hướng đến checkout
    router.push("/checkout");
    onClose();
  };

  // Xử lý mở bảng kích thước
  const handleOpenSizeChart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSizeChartOpen(true);
  };

  // Xử lý đóng bảng kích thước
  const handleCloseSizeChart = () => {
    setIsSizeChartOpen(false);
  };

  return (
    <>
      {/* Popup chính */}
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
              className="flex flex-col laptop:flex-row laptop:gap-8 desktop:flex-row desktop:gap-8 bg-white p-6 rounded-lg w-[100%] max-w-[80%] laptop:max-w-[80%] relative"
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

              {/* Hình ảnh sản phẩm */}
              <Image
                src={product.images[0]}
                alt={product.name || "Sản phẩm"}
                width={200}
                height={200}
                className="w-auto h-[70%] object-cover rounded-md"
                draggable={false}
              />
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
                      <div className="">
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
                  </label>
                  {sizes.length > 0 ? (
                    <div className="flex gap-3 flex-wrap">
                      {sizes.map((size) => (
                        <div
                          key={size.value}
                          onClick={() =>
                            size.inStock && setSelectedSize(size.value)
                          }
                          className={`w-auto h-auto rounded-sm p-3 flex items-center justify-center border-2 cursor-pointer ${
                            selectedSize === size.value
                              ? "border-black bg-black text-white border-2 border-solid"
                              : "border-gray-300 border-2 border-solid"
                          } ${
                            !size.inStock
                              ? "opacity-50 bg-[#CACACA] cursor-not-allowed"
                              : ""
                          }`}
                          aria-label={`Chọn size ${size.value}${
                            size.inStock ? "" : " (Hết hàng)"
                          }`}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              size.inStock && setSelectedSize(size.value);
                            }
                          }}
                        >
                          <span className="text-sm font-medium">
                            Size {size.value} {!size.inStock}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Không có size để chọn
                    </p>
                  )}
                </div>

                {/* Chọn số lượng */}
                <div className="">
                  <label className="block text-lg font-bold text-black mb-2">
                    Số lượng:
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-100"
                      aria-label="Giảm số lượng"
                    >
                      -
                    </button>
                    <span className="w-10 text-center border border-gray-300 p-2 rounded-md">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-100"
                      aria-label="Tăng số lượng"
                    >
                      +
                    </button>
                  </div>
                </div>
                {couponId && (
                  <div className="mt-2 flex items-center gap-2 cursor-pointer">
                    <input
                      id="applyCoupon"
                      type="checkbox"
                      checked={applyCoupon}
                      onChange={() => setApplyCoupon(!applyCoupon)}
                      className="accent-black cursor-pointer w-[2%] h-full"
                    />
                    <label
                      htmlFor="applyCoupon"
                      className="text-sm cursor-pointer"
                    >
                      Áp dụng mã giảm giá hiện tại
                    </label>
                  </div>
                )}
                {/* Nút xác nhận */}
                <button
                  onClick={handleConfirm}
                  className="w-full bg-black text-white font-bold text-lg px-3 py-3 rounded-md hover:bg-gray-800 transition-colors"
                  aria-label={`Xác nhận mua sản phẩm ${product.name}`}
                >
                  Mua ngay
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Popup bảng kích thước */}
      <AnimatePresence>
        {isSizeChartOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999]"
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
};

export default BuyNowPopup;
