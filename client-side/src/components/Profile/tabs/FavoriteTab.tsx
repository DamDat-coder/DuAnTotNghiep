"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useWishlist } from "@/contexts/WishlistContext";
import toast from "react-hot-toast";
import { IProduct } from "@/types/product";
import { useAuth } from "@/contexts/AuthContext";
import { getWishlistFromApi, removeFromWishlistApi } from "@/services/userApi";
import { useEffect } from "react";

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
  const { wishlist, setWishlist } = useWishlist(); // Lấy wishlist từ context
  const { user } = useAuth(); // Lấy user từ AuthContext
  const router = useRouter();

  useEffect(() => {
    const fetchWishlist = async () => {
      if (user) {
        const wishlistFromDB = await getWishlistFromApi(user.id); // Gọi API lấy wishlist từ DB
        setWishlist(wishlistFromDB); // Cập nhật wishlist vào state
      }
    };

    fetchWishlist();
  }, [user, setWishlist]); // Gọi lại khi user thay đổi

  const handleRemoveFromWishlist = async (productId: string) => {
    if (user) {
      try {
        // Gọi API để xóa sản phẩm khỏi wishlist trong DB
        await removeFromWishlistApi(user.id, productId);

        // Cập nhật lại wishlist trong state
        setWishlist((prevWishlist) =>
          prevWishlist.filter((item) => item.id !== productId)
        );

        // Thông báo thành công
        toast.success("Đã xóa khỏi wishlist!");

        // Refresh lại trang
        console.log("Removed product from wishlist:", productId);
        router.refresh();
      } catch (error) {
        toast.error("Không thể xóa sản phẩm khỏi wishlist.");
        console.error("Error removing product from wishlist:", error);
      }
    }
  };

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
              // Kiểm tra và lấy giá trị hợp lệ cho price và discountedPrice
              const { price, discountPercent, discountedPrice } =
                getLowestPriceVariant(product);

              // Đảm bảo giá trị price và discountedPrice là hợp lệ
              const validPrice = price && price > 0 ? price : 0;
              const validDiscountedPrice =
                discountedPrice && discountedPrice > 0 ? discountedPrice : 0;

              return (
                <div
                  key={product.id}
                  className="flex items-center gap-4 border-b pb-4"
                >
                  {/* Hình ảnh */}
                  <Image
                    src={
                      product.images && product.images[0]
                        ? `/product/img/${product.images[0]}`
                        : "/placeholder.jpg" // Ảnh placeholder khi không có ảnh
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
                        {validPrice.toLocaleString("vi-VN")}₫
                      </div>
                    )}
                    <div className="text-red-600 font-semibold">
                      {validDiscountedPrice.toLocaleString("vi-VN")}₫
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
