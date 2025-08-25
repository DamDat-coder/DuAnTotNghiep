import { useState, useEffect, useRef } from "react";
import { recommendProducts } from "@/services/productApi";
import { IProduct } from "@/types/product";
import { useCart } from "@/contexts/CartContext";

export function useSuggestedProducts() {
  const { items } = useCart();
  const [suggestedProducts, setSuggestedProducts] = useState<IProduct[]>([]);
  const cache = useRef<{ [key: string]: IProduct[] }>({});
  const prevCartIdsRef = useRef<string[]>([]);

  useEffect(() => {
    const cartIds = [...new Set(items.map((item) => item.id))];
    const cartIdsKey = cartIds.join(",");

    // Kiểm tra nếu cartIds không thay đổi
    if (cartIdsKey === prevCartIdsRef.current.join(",")) {
      return;
    }

    // Kiểm tra cache
    if (cache.current[cartIdsKey]) {
      setSuggestedProducts(cache.current[cartIdsKey]);
      prevCartIdsRef.current = cartIds;
      return;
    }

    async function fetchSuggestedProducts() {
      try {
        const userBehavior = {
          viewed: [],
          cart: cartIds,
        };
        const response = await recommendProducts(userBehavior);
        cache.current[cartIdsKey] = response.data || [];
        setSuggestedProducts(response.data || []);
        prevCartIdsRef.current = cartIds;
      } catch (error) {
        console.error("Lỗi khi lấy sản phẩm gợi ý:", error);
        setSuggestedProducts([]);
      }
    }

    fetchSuggestedProducts();
  }, [items]);

  return suggestedProducts;
}