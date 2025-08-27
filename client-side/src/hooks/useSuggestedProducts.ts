import { useState, useEffect, useRef } from "react";
import { recommendProducts, fetchProducts } from "@/services/productApi";
import { IProduct } from "@/types/product";
import { useCart } from "@/contexts/CartContext";

export function useSuggestedProducts() {
  const { items } = useCart();
  const [suggestedProducts, setSuggestedProducts] = useState<IProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cache = useRef<{ [key: string]: IProduct[] }>({});
  const prevCartIdsRef = useRef<string[]>([]);

  useEffect(() => {
    console.log("Cart items:", items);
    const cartIds = [...new Set(items.map((item) => item.id))];
    console.log("Cart IDs:", cartIds);
    const cartIdsKey = cartIds.join(",");
    console.log("Cart IDs Key:", cartIdsKey);

    if (cartIdsKey === prevCartIdsRef.current.join(",")) {
      console.log("Cart IDs không thay đổi, bỏ qua gọi API");
      setIsLoading(false);
      return;
    }

    if (cache.current[cartIdsKey]) {
      console.log("Lấy từ cache:", cache.current[cartIdsKey]);
      setSuggestedProducts(cache.current[cartIdsKey]);
      prevCartIdsRef.current = cartIds;
      setIsLoading(false);
      return;
    }

    async function fetchSuggestedProducts() {
      try {
        setIsLoading(true);
        setError(null);
        const userBehavior = {
          viewed: [],
          cart: cartIds,
        };
        console.log("Gửi yêu cầu recommendProducts với:", userBehavior);
        const response = await recommendProducts(userBehavior);
        console.log("Kết quả từ recommendProducts:", response.data);
        cache.current[cartIdsKey] = response.data || [];
        setSuggestedProducts(response.data || []);
        prevCartIdsRef.current = cartIds;
      } catch (error) {
        console.error("Lỗi khi lấy sản phẩm gợi ý:", error);
        setError("Lỗi khi lấy sản phẩm gợi ý");
        console.log("Bắt đầu gọi fetchProducts (fallback)");
        try {
          console.log("fallbackProducts");
          const fallbackProducts = await fetchProducts({
            sort_by: "best_selling",
            is_active: true,
            limit: 5,
          });
          console.log("Kết quả từ fetchProducts:", fallbackProducts.data);
          cache.current[cartIdsKey] = fallbackProducts.data || [];
          setSuggestedProducts(fallbackProducts.data || []);
          prevCartIdsRef.current = cartIds;
        } catch (fallbackError) {
          console.error("Lỗi khi lấy sản phẩm bán chạy:", fallbackError);
          setError("Lỗi khi lấy sản phẩm bán chạy");
          setSuggestedProducts([]);
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchSuggestedProducts();
  }, [items]);

  return { suggestedProducts, isLoading, error };
}