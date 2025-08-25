"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { IProduct } from "@/types/product";
import { useCartDispatch } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import LoginPopup from "@/components/Core/Layout/Popups/AuthAction/LoginPopup";
import RegisterPopup from "@/components/Core/Layout/Popups/AuthAction/RegisterPopup";
import ForgotPasswordPopup from "@/components/Core/Layout/Popups/PasswordAction/ForgotPasswordPopup";
import ResetPasswordPopup from "@/components/Core/Layout/Popups/PasswordAction/ResetPasswordPopup";

// Định nghĩa kiểu cho các props của các popup
interface AddToCartPopupProps {
  product: IProduct;
  isOpen: boolean;
  onClose: () => void;
}

// Component AddToCartPopup
const AddToCartPopup = ({ product, isOpen, onClose }: AddToCartPopupProps) => {
  const dispatch = useCartDispatch();
  const firstAvailableVariant = product.variants.find((v) => v.stock > 0);

  const [selectedSize, setSelectedSize] = useState<string>(
    firstAvailableVariant?.size || ""
  );
  const [selectedColor, setSelectedColor] = useState<string>(
    firstAvailableVariant?.color || ""
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState<boolean>(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState<boolean>(false);
  const [isForgotOpen, setIsForgotOpen] = useState<boolean>(false);
  const [isResetOpen, setIsResetOpen] = useState<boolean>(false);
  const [resetToken, setResetToken] = useState<string>("");
  const { user, openLoginWithData, setOpenLoginWithData, registerFormData } =
    useAuth();

  useEffect(() => {
    if (
      isOpen ||
      isSizeChartOpen ||
      isLoginOpen ||
      isRegisterOpen ||
      isForgotOpen ||
      isResetOpen
    ) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [
    isOpen,
    isSizeChartOpen,
    isLoginOpen,
    isRegisterOpen,
    isForgotOpen,
    isResetOpen,
  ]);

  const sizes = Array.from(new Set(product.variants.map((v) => v.size))).map(
    (size) => ({
      value: size,
      inStock: product.variants.some((v) => v.size === size && v.stock > 0),
    })
  );

  const colors = Array.from(new Set(product.variants.map((v) => v.color)));

  const colorMap: { [key: string]: string } = {
    Trắng: "#FFFFFF",
    "Xanh navy": "#000080",
    Đen: "#000000",
    Đỏ: "#FF0000",
    Xám: "#808080",
  };

  const selectedVariant = product.variants.find(
    (v) => v.size === selectedSize && v.color === selectedColor
  );

  const maxQuantity = selectedVariant ? selectedVariant.stock : 0;

  const availableSizes = selectedColor
    ? product.variants
        .filter((v) => v.color === selectedColor && v.stock > 0)
        .map((v) => v.size)
    : sizes.map((s) => s.value);

  // Tính giá dựa trên số lượng
  const discountedPrice = Math.round(
    (selectedVariant?.price ?? 0) *
      (1 - (selectedVariant?.discountPercent ?? 0) / 100)
  );
  const totalDiscountedPrice = discountedPrice * quantity;
  const totalOriginalPrice = selectedVariant ? selectedVariant.price * quantity : 0;

  useEffect(() => {
    if (quantity > maxQuantity) {
      setQuantity(Math.max(1, maxQuantity));
    }
  }, [maxQuantity, quantity]);

  useEffect(() => {
    if (selectedSize && !availableSizes.includes(selectedSize)) {
      setSelectedSize("");
    }
  }, [selectedColor, availableSizes, selectedSize]);

  useEffect(() => {
    if (openLoginWithData) {
      setIsLoginOpen(false);
      setOpenLoginWithData(false);
    }
  }, [openLoginWithData, setOpenLoginWithData]);

  useEffect(() => {
    const accessToken =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;
    if (accessToken && user) {
      const pendingCartRaw = localStorage.getItem("pendingCart");
      if (pendingCartRaw) {
        try {
          const pendingCart = JSON.parse(pendingCartRaw);
          const {
            product: pendingProduct,
            selectedSize,
            selectedColor,
            quantity,
          } = pendingCart;

          if (
            !selectedColor ||
            !selectedSize ||
            quantity < 1 ||
            !pendingProduct?.id ||
            !pendingProduct?.categoryId
          ) {
            toast.error("Dữ liệu giỏ hàng tạm thời không hợp lệ!");
            localStorage.removeItem("pendingCart");
            return;
          }

          const pendingVariant = pendingProduct.variants.find(
            (v: any) => v.size === selectedSize && v.color === selectedColor
          );

          if (!pendingVariant || pendingVariant.stock < quantity) {
            toast.error("Sản phẩm trong giỏ hàng tạm thời không đủ hàng!");
            localStorage.removeItem("pendingCart");
            return;
          }

          const cartItem = {
            id: pendingProduct.id,
            name: pendingProduct.name,
            price: Math.round(
              (pendingVariant.price ?? 0) *
                (1 - (pendingVariant.discountPercent ?? 0) / 100)
            ),
            originPrice: pendingVariant.price,
            discountPercent: pendingVariant.discountPercent,
            image: pendingProduct.images[0] || "",
            quantity,
            size: selectedSize,
            color: selectedColor,
            liked: false,
            selected: false,
            categoryId: pendingProduct.categoryId,
            stock: pendingVariant.stock,
          };

          dispatch({ type: "add", item: cartItem });
          toast.success("Đã thêm sản phẩm từ giỏ hàng tạm thời!", { id: "pending-cart-success" });
          localStorage.removeItem("pendingCart");
        } catch (error) {
          toast.error("Không thể thêm sản phẩm từ giỏ hàng tạm thời!", { id: "pending-cart-error" });
          localStorage.removeItem("pendingCart");
        }
      }
    }
  }, [user, dispatch]);

  const handleConfirm = () => {
    const accessToken =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;
    if (!accessToken) {
      const pendingCart = {
        product,
        selectedSize,
        selectedColor,
        quantity,
      };
      localStorage.setItem("pendingCart", JSON.stringify(pendingCart));
      localStorage.setItem("redirectToCart", "true");
      setIsLoginOpen(true);
      toast.error("Bạn vui lòng đăng nhập trước khi thêm vào giỏ hàng!", { id: "auth-error" });
      return;
    }
    if (!selectedColor) {
      toast.error("Vui lòng chọn màu sắc!", { id: "color-error" });
      return;
    }
    if (!selectedSize) {
      toast.error("Vui lòng chọn kích thước!", { id: "size-error" });
      return;
    }
    if (quantity < 1) {
      toast.error("Số lượng phải lớn hơn 0!", { id: "quantity-error" });
      return;
    }
    if (!selectedVariant || selectedVariant.stock < quantity) {
      toast.error("Sản phẩm không đủ hàng!", { id: "stock-error" });
      return;
    }
    if (!product.categoryId) {
      toast.error("Không thể thêm sản phẩm do thiếu thông tin danh mục!", { id: "category-error" });
      return;
    }

    const cartItem = {
      id: product.id,
      name: product.name,
      price: discountedPrice, // Giá đơn vị sau giảm giá
      originPrice: selectedVariant.price, // Giá đơn vị gốc
      discountPercent: selectedVariant.discountPercent,
      image: product.images[0] || "",
      quantity,
      size: selectedSize,
      color: selectedColor,
      liked: false,
      selected: false, // Đồng bộ với useCheckout, mặc định không chọn
      categoryId: product.categoryId,
      stock: selectedVariant.stock,
    };

    dispatch({ type: "add", item: cartItem });
    toast.success("Bạn đã thêm vào giỏ hàng thành công!", { id: "add-to-cart-success" });
    onClose();
  };

  const handleOpenSizeChart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSizeChartOpen(true);
  };

  const handleCloseSizeChart = () => {
    setIsSizeChartOpen(false);
  };

  const handleCloseLoginPopup = () => {
    setIsLoginOpen(false);
  };

  const handleOpenRegister = () => {
    setIsLoginOpen(false);
    setIsRegisterOpen(true);
  };

  const handleCloseRegister = () => {
    setIsRegisterOpen(false);
  };

  const handleOpenForgotPassword = () => {
    setIsLoginOpen(false);
    setIsForgotOpen(true);
  };

  const handleCloseForgotPassword = () => {
    setIsForgotOpen(false);
  };

  const handleOpenLogin = () => {
    setIsRegisterOpen(false);
    setIsForgotOpen(false);
    setIsLoginOpen(true);
  };

  const handleOpenResetPassword = () => {
    setIsForgotOpen(false);
    setResetToken("sample-token"); // Thay bằng token thực tế từ API
    setIsResetOpen(true);
  };

  const handleCloseResetPassword = () => {
    setIsResetOpen(false);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
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
                <button
                  onClick={onClose}
                  className="absolute top-5 right-5 text-gray-500 hover:text-gray-700 text-xl font-bold"
                  aria-label="Đóng popup"
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
                  src={product.images[0]}
                  alt={product.name || "Sản phẩm"}
                  width={200}
                  height={200}
                  className="w-auto h-[9rem] laptop:h-[70%] desktop:h-[70%] object-cover rounded-md"
                  draggable={false}
                />
                <div className="flex gap-1 flex-col laptop:w-full laptop:flex-col laptop:gap-3 desktop:w-full desktop:flex-col desktop:gap-3">
                  <div className="flex flex-col gap-3">
                    <h2 className="text-xl font-bold text-black mt-4">
                      {product.name || "Sản phẩm"}
                    </h2>
                    <div className="flex items-center gap-4 mt-2">
                      <p className="text-red-500 font-bold text-lg">
                        {totalDiscountedPrice.toLocaleString("vi-VN")}₫
                      </p>
                      {selectedVariant && selectedVariant.discountPercent > 0 && (
                        <p className="text-sm text-[#374151] line-through">
                          {totalOriginalPrice.toLocaleString("vi-VN")}₫
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="">
                    <label className="block text-lg font-bold text-black mb-2">
                      Màu sắc:
                    </label>
                    {colors.length > 0 ? (
                      <div className="flex gap-3 flex-wrap">
                        {colors.map((color) => {
                          const isSelected = selectedColor === color;
                          const tickColor =
                            color === "Trắng" ? "black" : "white";
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
                        {sizes.map((size) => {
                          const isAvailable = selectedColor
                            ? product.variants.some(
                                (v) =>
                                  v.size === size.value &&
                                  v.color === selectedColor &&
                                  v.stock > 0
                              )
                            : size.inStock;
                          return (
                            <div
                              key={size.value}
                              onClick={() =>
                                isAvailable && setSelectedSize(size.value)
                              }
                              className={`px-4 py-2 border border-solid rounded-sm text-sm font-medium ${
                                selectedSize === size.value && isAvailable
                                  ? "bg-black text-white"
                                  : !isAvailable
                                  ? "bg-gray-300 text-gray-500 cursor-not-allowed opacity-50"
                                  : "hover:bg-gray-100"
                              }`}
                              aria-label={`Chọn size ${size.value}${
                                isAvailable ? "" : " (Hết hàng)"
                              }`}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  isAvailable && setSelectedSize(size.value);
                                }
                              }}
                            >
                              <span>Size {size.value}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        Không có size để chọn
                      </p>
                    )}
                  </div>

                  <div className="">
                    <label className="block text-lg font-bold text-black mb-2">
                      Số lượng:
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className={`w-10 h-10 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-100 ${
                          quantity <= 1 ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        aria-label="Giảm số lượng"
                      >
                        -
                      </button>
                      <span className="w-10 text-center border border-gray-300 p-2 rounded-md">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                        disabled={quantity >= maxQuantity}
                        className={`w-10 h-10 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-100 ${
                          quantity >= maxQuantity ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        aria-label="Tăng số lượng"
                      >
                        +
                      </button>
                    </div>
                    {selectedVariant && (
                      <p className="text-sm text-red-500 mt-1">
                        Còn {maxQuantity} sản phẩm
                      </p>
                    )}
                  </div>

                  <button
                    onClick={handleConfirm}
                    className="w-full bg-black text-white font-bold text-lg px-3 py-3 rounded-md hover:bg-gray-800 transition-colors"
                    aria-label={`Xác nhận thêm sản phẩm ${product.name} vào giỏ hàng`}
                  >
                    Thêm vào giỏ hàng
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
              <div className="flex justify-center items-center">
                <Image
                  src="/sizechart/1.png"
                  alt="Size Chart 1"
                  width={500}
                  height={350}
                  className="w-[500px] h-[350px]"
                />
                <Image
                  src="/sizechart/2.png"
                  alt="Size Chart 2"
                  width={500}
                  height={350}
                  className="w-[500px] h-[350px]"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isLoginOpen && (
          <LoginPopup
            isOpen={isLoginOpen}
            onClose={handleCloseLoginPopup}
            onOpenRegister={handleOpenRegister}
            initialFormData={registerFormData}
            onOpenForgotPassword={handleOpenForgotPassword}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isRegisterOpen && (
          <RegisterPopup
            isOpen={isRegisterOpen}
            onClose={handleCloseRegister}
            onOpenLogin={handleOpenLogin}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isForgotOpen && (
          <ForgotPasswordPopup
            isOpen={isForgotOpen}
            onClose={handleCloseForgotPassword}
            onOpenLogin={handleOpenLogin}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isResetOpen && (
          <ResetPasswordPopup
            isOpen={isResetOpen}
            onClose={handleCloseResetPassword}
            token={resetToken}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default AddToCartPopup;