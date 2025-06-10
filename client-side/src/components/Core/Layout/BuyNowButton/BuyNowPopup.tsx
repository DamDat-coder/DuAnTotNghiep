import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { IProduct } from "@/types/product";
import { motion, AnimatePresence } from "framer-motion";

// Giả lập dữ liệu sizes và colors
const mockSizes = [
  { value: "S", inStock: true },
  { value: "M", inStock: true },
  { value: "XL", inStock: true },
  { value: "2XL", inStock: true },
  { value: "3XL", inStock: false },
];
const mockColors = ["Trắng", "Xanh navy"];

// Hàm xử lý dữ liệu stock
const getSizesFromStock = (
  stock: { size: string; color: string; quantity: number }[]
): { value: string; inStock: boolean }[] => {
  const sizeMap = new Map<string, boolean>();
  stock.forEach((item) => {
    sizeMap.set(
      item.size,
      sizeMap.get(item.size) || false || item.quantity > 0
    );
  });
  return Array.from(sizeMap.entries()).map(([value, inStock]) => ({
    value,
    inStock,
  }));
};

// Hàm xử lý dữ liệu màu sắc
const getColorsFromStock = (
  stock: { size: string; color: string; quantity: number }[]
): string[] => {
  return [...new Set(stock.map((item) => item.color))];
};

// Hàm kiểm tra số lượng tồn kho tối đa
const getMaxQuantity = (
  stock: { size: string; color: string; quantity: number }[],
  selectedSize: string,
  selectedColor: string
): number => {
  const item = stock.find(
    (s) => s.size === selectedSize && s.color === selectedColor
  );
  return item ? item.quantity : 0;
};

interface BuyNowPopupProps {
  product: IProduct;
  isOpen: boolean;
  onClose: () => void;
}

const BuyNowPopup = ({ product, isOpen, onClose }: BuyNowPopupProps) => {
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState<boolean>(false);

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

  // Xử lý sizes
  const sizes = Array.isArray(product.sizes)
    ? product.sizes.map((size) =>
        typeof size === "string" ? { value: size, inStock: true } : size
      )
    : mockSizes;

  // Xử lý colors
  const colors =
    Array.isArray(product.colors) && product.colors.length > 0
      ? product.colors
      : mockColors;

  // Ánh xạ màu sắc
  const colorMap: { [key: string]: string } = {
    Trắng: "#FFFFFF",
    "Xanh navy": "#000080",
  };

  const handleConfirm = () => {
    // Validate dữ liệu
    if (!selectedSize) {
      toast.error("Vui lòng chọn kích thước!");
      return;
    }
    if (!selectedColor) {
      toast.error("Vui lòng chọn màu sắc!");
      return;
    }
    if (quantity < 1) {
      toast.error("Số lượng phải lớn hơn 0!");
      return;
    }

    // Xử lý hình ảnh
    const image =
      Array.isArray(product.images) && typeof product.images[0] === "string"
        ? product.images[0]
        : ""; // Giá trị mặc định nếu không có hình ảnh

    // Tạo query params
    const query = new URLSearchParams({
      productId: product.id,
      name: product.name || "",
      size: selectedSize,
      color: selectedColor,
      quantity: quantity.toString(),
      price: product.price.toString(),
      discountPercent: product.discountPercent.toString(),
      buyNow: "true",
      image,
    }).toString();

    // Chuyển hướng đến checkout
    router.push(`/checkout?${query}`);
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

  const discountedPrice = product.price * (1 - product.discountPercent / 100);

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
              {/* Nút đóng popup */}
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
                src={`/product/img/${
                  Array.isArray(product.images) && product.images.length > 0
                    ? typeof product.images[0] === "string"
                      ? product.images[0]
                      : ""
                    : ""
                }`}
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
                      {discountedPrice.toLocaleString("vi-VN")}₫
                    </p>
                    <p className="text-sm text-[#374151] line-through">
                      {product.price.toLocaleString("vi-VN")}₫
                    </p>
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
};

export default BuyNowPopup;
