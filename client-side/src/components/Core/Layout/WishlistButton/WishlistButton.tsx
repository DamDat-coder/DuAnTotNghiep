"use client";

import { useRouter } from "next/navigation";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import { IProduct } from "@/types/product";
import LikeIcon from "./LikeIcon";
import { useState } from "react";

interface WishlistButtonProps {
  product: IProduct;
  variant?: "white" | "black";
  borderColor?: "black" | "white" | "none";
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
  const [isLoading, setIsLoading] = useState(false);

  const handleWishlistToggle = async () => {
    if (isLoading) return;
    if (!user) {
      toast.error("🔐 Vui lòng đăng nhập để thêm vào danh sách yêu thích!");
      return;
    }

    setIsLoading(true);
    try {
      if (!isLiked) {
        await addToWishlist(product);
      } else {
        await removeFromWishlist(product.id);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      className="cursor-pointer"
      onClick={handleWishlistToggle}
      role="button"
      aria-label={isLiked ? "Xóa khỏi wishlist" : "Thêm vào wishlist"}
      disabled={isLoading} // Vô hiệu hóa khi đang loading
    >
      <LikeIcon variant={variant} isActive={isLiked} />
    </button>
  );
}
