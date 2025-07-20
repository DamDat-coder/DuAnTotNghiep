"use client";

import { useState, useEffect } from "react";
import { IProduct } from "@/types/product";
import ColorSelector from "./ColorSelector";
import SizeSelector from "./SizeSelector";
import PriceDisplay from "./PriceDisplay";
import ActionButtons from "./ActionButtons";
import SizeChartPopup from "./SizeChartPopup";

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
  const firstVariant = product.variants[0];
  const [selectedSize, setSelectedSize] = useState<string | null>(
    firstVariant?.size || null
  );
  const [selectedColor, setSelectedColor] = useState<string | null>(
    firstVariant?.color || null
  );
  const [isLiked, setIsLiked] = useState(false);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState<boolean>(false);
  const [selectedVariantPrice, setSelectedVariantPrice] = useState<{
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

  const availableSizes = selectedColor
    ? product.variants
        .filter((v) => v.color === selectedColor && v.stock > 0)
        .map((v) => v.size)
    : sizes.map((s) => s.value);

  const selectedVariant = product.variants.find(
    (v) => v.size === selectedSize && v.color === selectedColor
  );

  const maxQuantity = selectedVariant ? selectedVariant.stock : 0;

  useEffect(() => {
    if (selectedColor && selectedSize) {
      const variant = product.variants.find(
        (v) => v.color === selectedColor && v.size === selectedSize
      );
      if (variant) {
        setSelectedVariantPrice({
          price: variant.price,
          discountedPrice: variant.discountedPrice || variant.price,
          discountPercent: variant.discountPercent,
        });
      } else {
        setSelectedVariantPrice(null);
      }
    } else {
      const lowestVariant = product.variants[0];
      setSelectedVariantPrice({
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

  return (
    <>
      <div className="flex flex-col gap-9 tablet:py-6 laptop:py-8 laptop:gap-py-8 desktop:py-8 desktop:gap-py-8">
        <PriceDisplay selectedVariantPrice={selectedVariantPrice} />
        <ColorSelector
          colors={colors}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
          setSelectedSize={setSelectedSize}
          availableSizes={availableSizes}
        />
        <SizeSelector
          sizes={sizes}
          selectedSize={selectedSize}
          setSelectedSize={setSelectedSize}
          selectedColor={selectedColor}
          availableSizes={availableSizes}
          maxQuantity={maxQuantity}
          setIsSizeChartOpen={setIsSizeChartOpen}
        />
      </div>
      <ActionButtons
        product={product}
        selectedSize={selectedSize}
        selectedColor={selectedColor}
        selectedVariant={selectedVariant}
        isLiked={isLiked}
        setIsLiked={setIsLiked}
      />
      <SizeChartPopup
        isSizeChartOpen={isSizeChartOpen}
        handleCloseSizeChart={() => setIsSizeChartOpen(false)}
      />
    </>
  );
}