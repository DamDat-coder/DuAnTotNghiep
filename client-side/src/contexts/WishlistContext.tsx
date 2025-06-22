"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { IProduct } from "@/types/product";

interface WishlistContextType {
  wishlist: IProduct[];
  addToWishlist: (product: IProduct) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {
  const [wishlist, setWishlist] = useState<IProduct[]>([]);

  // Khởi tạo wishlist từ localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedWishlist = localStorage.getItem("wishlist");
      if (savedWishlist) {
        try {
          setWishlist(JSON.parse(savedWishlist));
        } catch (error) {
          console.error("Error parsing wishlist from localStorage:", error);
        }
      }
    }
  }, []);

  // Lưu wishlist vào localStorage khi thay đổi
  const saveWishlistToLocalStorage = (updatedWishlist: IProduct[]) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
        console.log("Saved wishlist to localStorage:", updatedWishlist);
      } catch (error) {
        console.error("Error saving wishlist to localStorage:", error);
      }
    }
  };

  const addToWishlist = (product: IProduct) => {
    setWishlist((prev) => {
      if (!prev.find((item) => item.id === product.id)) {
        const updatedWishlist = [...prev, product];
        saveWishlistToLocalStorage(updatedWishlist);
        return updatedWishlist;
      }
      return prev;
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist((prev) => {
      const updatedWishlist = prev.filter((item) => item.id !== productId);
      saveWishlistToLocalStorage(updatedWishlist);
      return updatedWishlist;
    });
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item.id === productId);
  };

  return (
    <WishlistContext.Provider
      value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};