"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWishlist } from "@/contexts/WishlistContext";
import toast from "react-hot-toast";
import { IProduct } from "@/types/product";
import { useAuth } from "@/contexts/AuthContext";
import { getWishlistFromApi, removeFromWishlistApi } from "@/services/userApi";
import { useEffect, useState } from "react";

// Hàm lấy giá thấp nhất từ variants - same as ProductGrid
const getLowestPriceVariant = (product: IProduct) => {
  if (!product.variants || product.variants.length === 0) {
    return { price: 0, discountPercent: 0 };
  }
  return product.variants.reduce(
    (min, variant) =>
      variant.price && variant.price < min.price ? variant : min,
    product.variants[0]
  );
};

export default function FavoriteTab() {
  const { wishlist, setWishlist } = useWishlist();
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const wishlistFromDB = await getWishlistFromApi(user.id);
        setWishlist(wishlistFromDB);
      } catch (error) {
        console.error("Error fetching wishlist:", error);
        toast.error("Không thể tải danh sách yêu thích.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlist();
  }, [user, setWishlist]);

  const handleRemoveFromWishlist = async (productId: string) => {
    if (!user) return;

    setIsLoading(true);
    try {
      await removeFromWishlistApi(user.id, productId);
      setWishlist(
        (prevWishlist) => prevWishlist.filter((item) => item.id !== productId) // Use id for consistency
      );
      toast.success("Đã xóa khỏi danh sách yêu thích!");
      router.refresh();
    } catch (error) {
      toast.error("Không thể xóa sản phẩm khỏi danh sách yêu thích.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div
          className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-blue-600 rounded-full"
          role="status"
          aria-label="loading"
        >
          <span className="sr-only">Đang tải...</span>
        </div>
        <p className="mt-2 text-gray-600">Đang tải danh sách yêu thích...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">SẢN PHẨM YÊU THÍCH</h1>
      <div>
        {wishlist.length === 0 ? (
          <p className="text-center text-gray-500">
            Chưa có sản phẩm yêu thích
          </p>
        ) : (
          <div className="space-y-6">
            {wishlist.map((product) => {
              const { price, discountPercent } = getLowestPriceVariant(product);

              // Calculate discounted price same as ProductGrid
              const discountedPrice = Math.round(
                price * (1 - discountPercent / 100)
              );

              const productImage = product.images[0];
              const productName = product.name || "Sản phẩm không tên";
              const categoryName =
                product.category?.name || "Danh mục không xác định";

              return (
                <div
                  key={product.id} // Use id for consistency
                  className="flex items-center gap-4 border-b pb-4"
                >
                  {/* Hình ảnh */}
                  <Link href={`/products/${product.id}`}>
                    <Image
                      src={productImage}
                      alt={productName}
                      width={96}
                      height={96}
                      className="object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                    />
                  </Link>

                  {/* Thông tin */}
                  <div className="flex-1 flex items-center justify-between">
                    <div>
                      <Link href={`/products/${product.id}`}>
                        <div>
                          <span className="font-semibold">{product.name}</span>
                          <span className="ml-2 text-sm text-gray-500">
                            ({product.variants && product.variants[0]?.color}/
                            {product.variants && product.variants[0]?.size})
                          </span>
                        </div>
                      </Link>

                      <p className="text-gray-500 text-sm">{categoryName}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveFromWishlist(product.id)} // Use id for consistency
                      aria-label={`Xóa ${productName} khỏi wishlist`}
                      disabled={isLoading}
                      className="ml-4"
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
