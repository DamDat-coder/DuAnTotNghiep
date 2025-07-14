import Image from "next/image";
import Link from "next/link";
import { IProduct } from "@/types/product";
import AddToCartButton from "../../Cart/AddToCartButton";

interface ProductCardProps {
  product: IProduct;
  onAddToCart?: (product: IProduct, e: React.MouseEvent) => void;
  onBuyNow?: (product: IProduct, e: React.MouseEvent) => void;
}

export default function ProductCard({
  product,
  onAddToCart,
  onBuyNow,
}: ProductCardProps) {
  const { name, category, images, variants } = product;
  const lowestVariant =
    variants?.reduce((min, v) => (v.price < min.price ? v : min), variants[0]) || {
      price: 0,
      discountPercent: 0,
    };
  const price = lowestVariant.price;
  const discountPercent = lowestVariant.discountPercent;
  const discountPrice = Math.round(price * (1 - discountPercent / 100));

  return (
    <div className="w-full flex flex-col bg-white relative" role="article">
      <Image
        src={images?.[0] || "/fallback.jpg"}
        alt={name || "Sản phẩm"}
        width={200}
        height={200}
        className="w-full h-[16.8125rem] laptop:h-[18.3125rem] object-cover rounded"
        draggable={false}
      />
      {discountPercent > 0 && (
        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
          -{discountPercent}%
        </div>
      )}
      <AddToCartButton onClick={(e) => onAddToCart?.(product, e)} />
      <div className="content flex flex-col py-4 gap-3 font-description">
        <div>
          <div className="name text-base font-bold text-[#374151] pb-2 two-line-clamp h-[3.5rem]">
            {name}
          </div>
          <div className="category text-base text-[#374151] truncate">
            {category?.name || "Danh mục"}
          </div>
        </div>
        <div className="price-container flex items-center gap-3">
          <div className="discountPrice text-[1rem] font-bold text-red-500">
            {discountPrice.toLocaleString("vi-VN")}₫
          </div>
          {discountPercent > 0 && (
            <div className="price text-sm text-gray-600 line-through">
              {price.toLocaleString("vi-VN")}₫
            </div>
          )}
        </div>
        <div className="flex gap-3 font-heading">
          <Link
            href={`/products/${product.id}`}
            className="p-3 border border-black border-solid rounded text-base"
            aria-label={`Xem chi tiết sản phẩm ${name}`}
          >
            Xem chi tiết
          </Link>
          <button
            onClick={(e) => onBuyNow?.(product, e)}
            className="p-3 border border-black bg-black text-white rounded font-bold text-base"
            aria-label={`Mua ngay sản phẩm ${name}`}
          >
            Mua ngay
          </button>
        </div>
      </div>
    </div>
  );
}
