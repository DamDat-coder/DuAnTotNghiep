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
import ConfirmDialog from "@/components/common/ConfirmDialog";

const colorMap: { [key: string]: string } = {
  Trắng: "#FFFFFF",
  "Xanh navy": "#000080",
  Đen: "#000000",
  Đỏ: "#FF0000",
  Xám: "#808080",
};

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
  const [confirmProduct, setConfirmProduct] = useState<IProduct | null>(null);

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

  const handleRemoveWithConfirm = (product: IProduct) => {
    const firstVariant = product.variants && product.variants[0];
    const stock = firstVariant ? firstVariant.stock : 0;
    if (!product.is_active || stock === 0) {
      setConfirmProduct(product);
    } else {
      handleRemoveFromWishlist(product.id);
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
    <>
      <div>
        <h1 className="text-xl font-semibold mb-4">SẢN PHẨM YÊU THÍCH</h1>
        <div>
          {wishlist.length === 0 ? (
            <p className="text-center text-gray-500">
              Chưa có sản phẩm yêu thích
            </p>
          ) : (
            <div className="space-y-6">
              {wishlist
                .slice() // tạo bản sao để không ảnh hưởng state gốc
                .sort((a, b) => {
                  // Lấy stock và is_active cho a, b
                  const stockA = a.variants?.[0]?.stock ?? 0;
                  const stockB = b.variants?.[0]?.stock ?? 0;
                  const activeA = a.is_active;
                  const activeB = b.is_active;

                  // Sản phẩm còn hàng lên đầu
                  if (activeA && stockA > 0 && (!activeB || stockB === 0))
                    return -1;
                  if (activeB && stockB > 0 && (!activeA || stockA === 0))
                    return 1;

                  // Sản phẩm tạm hết hàng ở giữa
                  if (activeA && stockA === 0 && (!activeB || stockB > 0))
                    return -1;
                  if (activeB && stockB === 0 && (!activeA || stockA > 0))
                    return 1;

                  // Sản phẩm ngừng kinh doanh xuống cuối
                  if (!activeA && activeB) return 1;
                  if (!activeB && activeA) return -1;

                  return 0;
                })
                .map((product) => {
                  const { price, discountPercent } =
                    getLowestPriceVariant(product);

                  // Calculate discounted price same as ProductGrid
                  const discountedPrice = Math.round(
                    price * (1 - discountPercent / 100)
                  );

                  const productImage = product.images[0];
                  const productName = product.name || "Sản phẩm không tên";
                  const categoryName =
                    product.category?.name || "Danh mục không xác định";

                  const firstVariant = product.variants && product.variants[0];
                  const color = firstVariant?.color || "";
                  const stock = firstVariant ? firstVariant.stock : 0;
                  const isActive = product.is_active;

                  return (
                    <div
                      key={product.id}
                      className="flex items-center gap-4 border-b pb-4"
                    >
                      {/* Hình ảnh */}
                      {isActive ? (
                        <Link href={`/products/${product.id}`}>
                          <Image
                            src={productImage}
                            alt={productName}
                            width={96}
                            height={96}
                            className="object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                          />
                        </Link>
                      ) : (
                        <div className="opacity-50 pointer-events-none">
                          <Image
                            src={productImage}
                            alt={productName}
                            width={96}
                            height={96}
                            className="object-cover rounded"
                          />
                        </div>
                      )}

                      {/* Thông tin */}
                      <div className="flex-1 flex items-center justify-between min-w-0">
                        <div className="min-w-0 w-[340px]">
                          {isActive ? (
                            <Link href={`/products/${product.id}`}>
                              <div className="font-semibold block text-base break-words line-clamp-2">
                                {product.name}
                              </div>
                            </Link>
                          ) : (
                            <div className="font-semibold block text-base break-words line-clamp-2 opacity-50">
                              {product.name}
                            </div>
                          )}
                          <span className="ml-2 text-sm text-gray-500 flex items-center gap-2">
                            {/* Hiển thị vòng tròn màu */}
                            {color && (
                              <span
                                className="inline-block w-4 h-4 rounded-full border border-gray-300"
                                style={{ backgroundColor: colorMap[color] || "#CCCCCC" }}
                                title={color}
                              />
                            )}
                            {color && <span>{color}</span>}
                            {firstVariant?.size && (
                              <span className="ml-1">/ {firstVariant.size}</span>
                            )}
                          </span>
                          <p className="text-gray-500 text-sm">{categoryName}</p>
                          {/* Trạng thái */}
                          {!isActive ? (
                            <div className="text-red-500 text-xs font-semibold mt-1">
                              Ngừng kinh doanh
                            </div>
                          ) : stock === 0 ? (
                            <div className="text-yellow-500 text-xs font-semibold mt-1">
                              Tạm thời hết hàng
                            </div>
                          ) : null}
                        </div>
                        {/* Nút xóa */}
                        <button
                          onClick={() => handleRemoveWithConfirm(product)} // Use id for consistency
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
                      <div className="text-right w-[100px]">
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
      <ConfirmDialog
        open={!!confirmProduct}
        title="Xác nhận xóa sản phẩm khỏi danh sách yêu thích"
        description={
          confirmProduct?.is_active === false
            ? "Sản phẩm này đã ngừng kinh doanh. Bạn có chắc muốn xóa khỏi danh sách yêu thích?"
            : "Sản phẩm này tạm thời hết hàng. Bạn có chắc muốn xóa khỏi danh sách yêu thích?"
        }
        onConfirm={() => {
          if (confirmProduct) handleRemoveFromWishlist(confirmProduct.id);
          setConfirmProduct(null);
        }}
        onCancel={() => setConfirmProduct(null)}
      />
    </>
  );
}
