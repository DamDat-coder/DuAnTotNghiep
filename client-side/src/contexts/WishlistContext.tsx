"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { IProduct } from "@/types/product";
import {
  addProductToWishlistApi,
  removeFromWishlistApi,
  getWishlistFromApi,
} from "@/services/userApi"; // Đảm bảo bạn đã import đúng hàm
import toast from "react-hot-toast";
import { fetchProductById } from "@/services/productApi";
import { useAuth } from "@/contexts/AuthContext"; // Đảm bảo bạn đã tạo AuthContext

interface WishlistContextType {
  wishlist: IProduct[];
  setWishlist: React.Dispatch<React.SetStateAction<IProduct[]>>;
  addToWishlist: (product: IProduct) => void;
  removeFromWishlist: (productId: string) => void;
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
  const { user } = useAuth(); // Lấy user từ AuthContext
  const [wishlist, setWishlist] = useState<IProduct[]>([]);

  useEffect(() => {
    const initializeWishlist = async () => {
      if (typeof window !== "undefined") {
        // Lấy wishlist từ localStorage
        const savedWishlist = localStorage.getItem("wishlist");
        if (savedWishlist) {
          try {
            setWishlist(JSON.parse(savedWishlist)); // Đặt wishlist từ localStorage
          } catch (error) {
            console.error("Error parsing wishlist from localStorage:", error);
          }
        }

        // Lấy wishlist từ DB nếu có
        if (user) {
          try {
            // Lấy wishlist từ DB, đây có thể là mảng các ID sản phẩm (string[])
            const wishlistFromDB: string[] = await getWishlistFromApi(user.id); // Giả sử API trả về mảng ID sản phẩm

            if (wishlistFromDB) {
              // Chuyển đổi các ID thành sản phẩm chi tiết (IProduct[])
              const detailedWishlist = await getProductDetails(wishlistFromDB); // Chuyển đổi các ID thành IProduct[]
              setWishlist(detailedWishlist);
              localStorage.setItem(
                "wishlist",
                JSON.stringify(detailedWishlist)
              ); // Lưu vào localStorage
            }
          } catch (error) {
            console.error("Error fetching wishlist from DB:", error);
          }
        }
      }
    };

    initializeWishlist();
  }, [user]);

  // Hàm để lấy chi tiết sản phẩm từ ID
  const getProductDetails = async (
    productIds: string[]
  ): Promise<IProduct[]> => {
    const products: IProduct[] = [];
    for (const id of productIds) {
      const product = await fetchProductById(id); // Giả sử bạn có hàm fetchProductById để lấy chi tiết sản phẩm
      if (product) products.push(product);
    }
    return products;
  };

  const saveWishlistToLocalStorage = (updatedWishlist: IProduct[]) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
      } catch (error) {
        console.error("Error saving wishlist to localStorage:", error);
      }
    }
  };

  const addToWishlist = async (product: IProduct) => {
    setWishlist((prev) => {
      if (!prev.find((item) => item.id === product.id)) {
        const updatedWishlist = [...prev, product];
        saveWishlistToLocalStorage(updatedWishlist);

        if (user) {
          // Gọi API để thêm sản phẩm vào DB
          addProductToWishlistApi(user.id, product.id)
            .then((response) => {
              toast.success("Product added to wishlist!");
            })
            .catch((error) => {
              console.error("Error adding product to wishlist:", error);
              toast.error("Failed to add product to wishlist.");
            });
        }

        return updatedWishlist;
      }
      return prev;
    });
  };

  const removeFromWishlist = async (productId: string) => {
    setWishlist((prev) => {
      const updatedWishlist = prev.filter((item) => item.id !== productId);
      saveWishlistToLocalStorage(updatedWishlist);

      if (user) {
        // Gọi API để xoá sản phẩm khỏi DB
        removeFromWishlistApi(user.id, productId)
          .then((response) => {
            toast.success("Product removed from wishlist!");
          })
          .catch((error) => {
            console.error("Error removing product from wishlist:", error);
            toast.error("Failed to remove product from wishlist.");
          });
      }

      return updatedWishlist;
    });
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
