"use client";

import Image from "next/image";

interface SizeSelectorProps {
  sizes: { value: string; inStock: boolean }[];
  selectedSize: string | null;
  setSelectedSize: (size: string) => void;
  selectedColor: string | null;
  availableSizes: string[];
  maxQuantity: number;
  setIsSizeChartOpen: (open: boolean) => void;
}

export default function SizeSelector({
  sizes,
  selectedSize,
  setSelectedSize,
  selectedColor,
  availableSizes,
  maxQuantity,
  setIsSizeChartOpen,
}: SizeSelectorProps) {
  const handleSizeChange = (size: string) => {
    if (
      sizes.find((s) => s.value === size)?.inStock &&
      (!selectedColor || availableSizes.includes(size))
    ) {
      setSelectedSize(size);
    }
  };

  const handleOpenSizeChart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSizeChartOpen(true);
  };

  return (
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
      {maxQuantity > 0 && (
        <p className="text-sm text-red-500 mt-1">
          Còn {maxQuantity} sản phẩm
        </p>
      )}
    </div>
  );
}