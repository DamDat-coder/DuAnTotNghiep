// utils/product.ts
import { IProduct } from "@/types/product";

export const getLowestPriceVariant = (product: IProduct) => {
  if (!product.variants || product.variants.length === 0) {
    return { price: 0, discountPercent: 0 };
  }
  return product.variants.reduce(
    (min, variant) =>
      variant.price && variant.price < min.price ? variant : min,
    product.variants[0]
  );
};
