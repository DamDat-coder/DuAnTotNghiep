"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
import { IProduct } from "@/types/product";
import {
  addProductToWishlistApi,
  removeFromWishlistApi,
  getWishlistFromApi,
} from "@/services/userApi";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";

interface WishlistContextType {
  wishlist: IProduct[];
  setWishlist: React.Dispatch<React.SetStateAction<IProduct[]>>;
  addToWishlist: (product: IProduct) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

export const WishlistProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<IProduct[]>([]);
  const isApiCalled = useRef(false); // Ngăn useEffect gọi lại do Strict Mode

  useEffect(() => {
    const initializeWishlist = async () => {
      if (isApiCalled.current) return;
      isApiCalled.current = true;

      if (typeof window !== "undefined") {
        const savedWishlist = localStorage.getItem("wishlist");
        if (savedWishlist) {
          try {
            setWishlist(JSON.parse(savedWishlist));
          } catch (error) {
            // Không làm gì nếu parse lỗi
          }
        }

        if (user) {
          try {
            const wishlistFromDB: IProduct[] = await getWishlistFromApi(
              user.id
            );
            if (wishlistFromDB) {
              setWishlist(wishlistFromDB);
              localStorage.setItem("wishlist", JSON.stringify(wishlistFromDB));
            }
          } catch (error) {
            // Không làm gì nếu API lỗi
          }
        }
      }
    };

    initializeWishlist();
  }, [user]);

  const saveWishlistToLocalStorage = (updatedWishlist: IProduct[]) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
      } catch (error) {
        // Không làm gì nếu lưu localStorage lỗi
      }
    }
  };

  const addToWishlist = async (product: IProduct) => {
    if (wishlist.find((item) => item.id === product.id)) {
      return; // Ngăn thêm trùng lặp
    }

    const prevWishlist = [...wishlist];
    setWishlist([...wishlist, product]);

    try {
      if (user) {
        await addProductToWishlistApi(user.id, product.id);
      }
      saveWishlistToLocalStorage([...wishlist, product]);
      toast.success("Đã thêm vào danh sách yêu thích!");
    } catch (error) {
      setWishlist(prevWishlist);
      toast.error("Không thể thêm sản phẩm vào danh sách yêu thích.");
    }
  };

  const removeFromWishlist = async (productId: string) => {
    const prevWishlist = [...wishlist]; // Lưu trạng thái trước
    setWishlist(wishlist.filter((item) => item.id !== productId)); // Cập nhật tạm thời

    try {
      if (user) {
        await removeFromWishlistApi(user.id, productId); // Gọi API xóa khỏi DB
      }
      saveWishlistToLocalStorage(
        wishlist.filter((item) => item.id !== productId)
      );
      toast.success("Đã xóa khỏi danh sách yêu thích!");
    } catch (error) {
      setWishlist(prevWishlist); // Rollback nếu API thất bại
      toast.error("Không thể xóa sản phẩm khỏi danh sách yêu thích.");
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item.id === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        setWishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
      }}
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
