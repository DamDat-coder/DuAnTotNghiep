// src/hooks/useCart.ts
import { useState, useEffect } from "react";
import { fetchProducts } from "@/services/api";
import { IProduct } from "@/types";

interface CartItem {
  id: string;
  name: string;
  price: number;
  discountPercent: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
  liked: boolean;
}

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: "1",
      name: "MLB - Áo khoác phối mũ unisex Gopcore Basic",
      price: 5589000,
      discountPercent: 68,
      image: "/featured/featured_1.jpg",
      size: "XL",
      color: "Đen",
      quantity: 1,
      liked: false,
    },
    {
      id: "2",
      name: "Áo thun unisex phong cách đường phố",
      price: 500000,
      discountPercent: 20,
      image: "/featured/featured_1.jpg",
      size: "M",
      color: "Trắng",
      quantity: 2,
      liked: true,
    },
  ]);

  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const fetchedProducts = await fetchProducts();
        setProducts(fetchedProducts);
      } catch (err) {
        setError("Có lỗi xảy ra khi tải dữ liệu sản phẩm gợi ý.");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []); // Chỉ gọi 1 lần khi component mount

  const handleQuantityChange = (id: string, change: number) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const toggleLike = (id: string) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, liked: !item.liked } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const totalPrice = cartItems.reduce((total, item) => {
    const discountPrice = item.price * (1 - item.discountPercent / 100);
    return total + discountPrice * item.quantity;
  }, 0);

  return {
    cartItems,
    products,
    loading,
    error,
    handleQuantityChange,
    toggleLike,
    removeItem,
    totalPrice,
  };
};