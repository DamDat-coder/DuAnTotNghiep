"use client";

import { useRouter } from "next/navigation";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import { IProduct } from "@/types/product";
import LikeIcon from "./LikeIcon";

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

  const handleWishlistToggle = () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để thêm vào wishlist!");
      return;
    }

    if (isLiked) {
      removeFromWishlist(product.id);
      toast.success("Đã xóa khỏi wishlist!");
    } else {
      addToWishlist(product);
      toast.success("Đã thêm vào wishlist!");
    }
    console.log("Wishlist toggled for product:", product.id, "isLiked:", !isLiked); // Debug
  };

  return (
    <button
      className="cursor-pointer"
      onClick={handleWishlistToggle}
      role="button"
      aria-label={isLiked ? "Xóa khỏi wishlist" : "Thêm vào wishlist"}
    >
      <LikeIcon
        variant={variant}
        isActive={isLiked}
      />
    </button>
  );
}