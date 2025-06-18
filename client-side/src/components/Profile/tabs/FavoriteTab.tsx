"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useWishlist } from "@/contexts/WishlistContext";
import toast from "react-hot-toast";
import { IProduct } from "@/types/product";

const getLowestPriceVariant = (product: IProduct) => {
  if (!product.variants || product.variants.length === 0) {
    return { price: 0, discountPercent: 0, discountedPrice: 0 };
  }
  return product.variants.reduce(
    (min, variant) =>
      variant.discountedPrice < min.discountedPrice ? variant : min,
    product.variants[0]
  );
};

export default function FavoriteTab() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const router = useRouter();

  const handleRemoveFromWishlist = (productId: string) => {
    removeFromWishlist(productId);
    toast.success("Đã xóa khỏi wishlist!");
    console.log("Removed product from wishlist:", productId); // Debug
    router.refresh(); // Refresh trang để cập nhật UI
  };

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">SẢN PHẨM YÊU THÍCH</h1>
      <div>
        {wishlist.length === 0 ? (
          <p className="text-center text-gray-500">Chưa có sản phẩm yêu thích</p>
        ) : (
          <div className="space-y-6">
            {wishlist.map((product) => {
              const { price, discountPercent, discountedPrice } =
                getLowestPriceVariant(product);
              return (
                <div
                  key={product.id}
                  className="flex items-center gap-4 border-b pb-4"
                >
                  {/* Hình ảnh */}
                  <Image
                    src={
                      product.images[0]
                        ? `/product/img/${product.images[0]}`
                        : "/placeholder.jpg"
                    }
                    alt={product.name || "Sản phẩm"}
                    width={96}
                    height={96}
                    className="object-cover rounded"
                  />

                  {/* Thông tin */}
                  <div className="flex-1">
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-gray-500 text-sm">
                      {product.category?.name || "Danh mục"}
                    </p>
                    <button
                      onClick={() => handleRemoveFromWishlist(product.id)}
                      aria-label={`Xóa ${product.name} khỏi wishlist`}
                    >
                      <div className="w-8 h-8 rounded-full bg-white border-2 border-solid border-[#E7E7E7] flex justify-center items-center">
                        <Image
                          src="/product/product_like_active.svg"
                          width={16}
                          height={16}
                          alt="Unlike"
                          className="w-5 h-5"
                        />
                      </div>
                    </button>
                  </div>

                  {/* Giá */}
                  <div className="text-right">
                    {discountPercent > 0 && (
                      <div className="text-sm text-gray-400 line-through">
                        {price.toLocaleString("vi-VN")}₫
                      </div>
                    )}
                    <div className="text-red-600 font-semibold">
                      {discountedPrice.toLocaleString("vi-VN")}₫
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}