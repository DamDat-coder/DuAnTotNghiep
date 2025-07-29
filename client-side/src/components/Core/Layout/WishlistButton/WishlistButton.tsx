"use client";

import { useRouter } from "next/navigation";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import { IProduct } from "@/types/product";
import LikeIcon from "./LikeIcon";
import WishlistPopup from "./WishlistPopup";
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
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleWishlistToggle = async () => {
    if (isLoading) return;
    if (!user) {
      toast.error("🔐 Vui lòng đăng nhập để thêm vào danh sách yêu thích!");
      return;
    }
    setIsPopupOpen(true);
  };

  const handleAddWishlist = async () => {
    setIsLoading(true);
    try {
      await addToWishlist(product);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWishlistClick = () => {
    if (isInWishlist(product.id)) {
     
      removeFromWishlist(product.id);
      return;
    }
    setIsPopupOpen(true); 
  };

  return (
    <>
      <button
        className="cursor-pointer"
        onClick={handleWishlistClick}
        role="button"
        aria-label="Thêm vào wishlist"
        disabled={isLoading}
      >
        <LikeIcon variant={variant} isActive={isLiked} />
      </button>
      {isPopupOpen && (
        <WishlistPopup
          product={product}
          isOpen={isPopupOpen}
          onClose={() => setIsPopupOpen(false)}
          onAdd={handleAddWishlist}
        />
      )}
    </>
  );
}
