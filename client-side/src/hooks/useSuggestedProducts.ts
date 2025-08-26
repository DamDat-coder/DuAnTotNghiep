import { useState, useEffect, useRef } from "react";
import { recommendProducts, fetchProducts } from "@/services/productApi";
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
        // Fallback: Lấy sản phẩm bán chạy nếu API recommendProducts trả về lỗi
        try {
                    const fallbackProducts = await fetchProducts({
            sort_by: "best_selling",
            is_active: true,
            limit: 5,
          });
          cache.current[cartIdsKey] = fallbackProducts.data || [];
          setSuggestedProducts(fallbackProducts.data || []);
          prevCartIdsRef.current = cartIds;
        } catch (fallbackError) {
          console.error("Lỗi khi lấy sản phẩm bán chạy:", fallbackError);
          setSuggestedProducts([]);
        }
      }
    }

    fetchSuggestedProducts();
  }, [items]);

  return suggestedProducts;
}