"use client";

interface PriceDisplayProps {
  selectedVariantPrice: {
    price: number;
    discountedPrice?: number;
    discountPercent: number;
  } | null;
}

export default function PriceDisplay({ selectedVariantPrice }: PriceDisplayProps) {
  return (
    selectedVariantPrice && (
      <div className="flex items-center gap-4">
        <div className="text-red-500 font-bold text-lg">
          {(
            selectedVariantPrice.discountedPrice || selectedVariantPrice.price
          ).toLocaleString("vi-VN")}
          ₫
        </div>
        <div
          className={`text-sm text-gray-500 line-through ${
            !selectedVariantPrice.discountPercent ? "hidden" : "block"
          }`}
        >
          {selectedVariantPrice.price.toLocaleString("vi-VN")}₫
        </div>
      </div>
    )
  );
}