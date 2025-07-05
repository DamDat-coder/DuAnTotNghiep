"use client";

import { useRouter } from "next/navigation";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import { IProduct } from "@/types/product";
import LikeIcon from "./LikeIcon";
import {
  addProductToWishlistApi,
  removeFromWishlistApi,
} from "@/services/userApi"; // Import các API gọi

interface WishlistButtonProps {
  product: IProduct;
  variant?: "white" | "black"; // Chọn icon màu
  borderColor?: "black" | "white" | "none"; // Chọn màu viền
}

export default function WishlistButton({
  product,
  variant = "white",
  borderColor = "none",
}: WishlistButtonProps) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const router = useRouter();
  const isLiked = isInWishlist(product.id);

  const handleWishlistToggle = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để thêm vào wishlist!");
      return;
    }

    // Nếu sản phẩm chưa có trong wishlist
    if (!isLiked) {
      try {
        // Thêm sản phẩm vào wishlist của DB qua API
        await addProductToWishlistApi(user.id, product.id);
        addToWishlist(product); // Cập nhật vào state wishlist
        toast.success("Đã thêm vào wishlist!");
      } catch (error) {
        console.error("Lỗi khi thêm sản phẩm vào wishlist:", error);
        toast.error("Không thể thêm sản phẩm vào wishlist.");
      }
    } else {
      try {
        // Xoá sản phẩm khỏi wishlist của DB qua API
        await removeFromWishlistApi(user.id, product.id);
        removeFromWishlist(product.id); // Cập nhật vào state wishlist
        toast.success("Đã xóa khỏi wishlist!");
      } catch (error) {
        console.error("Lỗi khi xóa sản phẩm khỏi wishlist:", error);
        toast.error("Không thể xóa sản phẩm khỏi wishlist.");
      }
    }
    console.log(
      "Wishlist toggled for product:",
      product.id,
      "isLiked:",
      !isLiked
    );
  };

  return (
    <button
      className="cursor-pointer"
      onClick={handleWishlistToggle}
      role="button"
      aria-label={isLiked ? "Xóa khỏi wishlist" : "Thêm vào wishlist"}
    >
      <LikeIcon variant={variant} isActive={isLiked} />
    </button>
  );
}
