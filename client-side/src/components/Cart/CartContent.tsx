"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Container from "@/components/Core/Container";
import { CartMobile, CartDesktop } from "@/components/Cart";
import ProductSection from "@/components/Home/ProductSection/ProductSection";
import { useCart, useCartDispatch } from "@/contexts/CartContext";
import { IProduct } from "@/types/product";
import {
  fetchProductsActiveStatus,
  recommendProducts,
  fetchProducts,
} from "@/services/productApi";
import { Toaster } from "react-hot-toast";

// Định nghĩa kiểu RecommendResponse
interface RecommendResponse {
  success: boolean;
  outfits?: any[];
  data: IProduct[];
}

export default function CartContent() {
  const cart = useCart();
  const dispatch = useCartDispatch();
  const [suggestedProducts, setSuggestedProducts] = useState<IProduct[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [productsActiveStatus, setProductsActiveStatus] = useState<{
    [key: string]: boolean;
  }>({});
  const [isSuggestedLoading, setIsSuggestedLoading] = useState(true);
  const cache = useRef<{ [key: string]: IProduct[] }>({});

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Kiểm tra trạng thái is_active của sản phẩm trong giỏ hàng
  useEffect(() => {
    async function checkProductsActiveStatus() {
      if (cart.items.length === 0) return;

      const productIds = [...new Set(cart.items.map((item) => item.id))];
      try {
        const activeStatus = await fetchProductsActiveStatus(productIds);
        const statusMap: { [key: string]: boolean } = activeStatus.reduce(
          (acc, { id, is_active }) => ({
            ...acc,
            [id]: is_active,
          }),
          {} as { [key: string]: boolean }
        );
        setProductsActiveStatus(statusMap);

        // Tự động bỏ chọn sản phẩm is_active: false
        cart.items.forEach((item) => {
          if (statusMap[item.id] === false && item.selected) {
            dispatch({
              type: "update",
              item: { ...item, selected: false },
            });
          }
        });
      } catch (error) {
        console.error("Lỗi khi kiểm tra trạng thái sản phẩm:", error);
      }
    }
    checkProductsActiveStatus();
  }, [cart.items, dispatch]);

  // Cập nhật trạng thái selectAll dựa trên các sản phẩm hợp lệ
  useEffect(() => {
    const validItems = cart.items.filter(
      (item) => productsActiveStatus[item.id] !== false
    );
    setSelectAll(
      validItems.length > 0 && validItems.every((item) => item.selected)
    );
  }, [cart.items, productsActiveStatus]);

  // Fetch gợi ý sản phẩm (fallback logic giống ProductContent)
  useEffect(() => {
    async function getSuggestedProducts() {
      if (cart.items.length === 0) {
        setSuggestedProducts([]);
        setIsSuggestedLoading(false);
        return;
      }

      const cacheKey = `cart_${cart.items
        .map((i) => i.id)
        .sort()
        .join("_")}`;

      if (cache.current[cacheKey]) {
        setSuggestedProducts(cache.current[cacheKey]);
        setIsSuggestedLoading(false);
        return;
      }

      try {
        // Bước 1: fallback nhanh bằng fetchProducts
        const fallbackProducts = await fetchProducts({
          sort_by: "best_selling",
          is_active: true,
          limit: 5,
        });
        cache.current[cacheKey] = fallbackProducts.data || [];
        setSuggestedProducts(fallbackProducts.data || []);
        setIsSuggestedLoading(false);

        // Bước 2: gọi recommendProducts với timeout
        const cartIds = [...new Set(cart.items.map((item) => item.id))];
        const userBehavior = {
          viewed: [],
          cart: cartIds,
        };

        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(
            () => reject(new Error("Timeout: recommendProducts quá lâu")),
            10000
          );
        });

        const recommendPromise = recommendProducts(userBehavior);
        const response = (await Promise.race([
          recommendPromise,
          timeoutPromise,
        ])) as unknown as RecommendResponse;

        if (response && response.success && response.data.length > 0) {
          cache.current[cacheKey] = response.data;
          setSuggestedProducts(response.data);
        }
      } catch (error) {
        console.error("Lỗi khi lấy sản phẩm gợi ý:", error);
        if (!cache.current[cacheKey]) {
          setSuggestedProducts([]);
        }
      } finally {
        setIsSuggestedLoading(false);
      }
    }
    getSuggestedProducts();
  }, [cart.items]);

  const totalPrice = useMemo(
    () =>
      cart.items
        .filter(
          (item) => item.selected && productsActiveStatus[item.id] !== false
        )
        .reduce(
          (sum, item) =>
            sum + item.price * (1 - item.discountPercent / 100) * item.quantity,
          0
        ),
    [cart.items, productsActiveStatus]
  );

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    cart.items.forEach((item) => {
      if (productsActiveStatus[item.id] !== false) {
        dispatch({
          type: "update",
          item: { ...item, selected: newSelectAll },
        });
      }
    });
  };

  const handleQuantityChange = (id: string, size: string, change: number) => {
    const item = cart.items.find((i) => i.id === id && i.size === size);
    if (!item || productsActiveStatus[item.id] === false) return;
    const newQuantity = Math.max(1, item.quantity + change);
    dispatch({
      type: "update",
      item: { ...item, quantity: newQuantity },
    });
  };

  const toggleLike = (id: string, size: string) => {
    const item = cart.items.find((i) => i.id === id && i.size === size);
    if (!item) return;
    dispatch({
      type: "update",
      item: { ...item, liked: !item.liked },
    });
  };

  const removeItem = (id: string, size: string, color: string) => {
    dispatch({ type: "remove", id, size, color });
  };

  return (
    <div className="py-8">
      <Container>
        <Toaster position="top-right" />
        <h1 className="text-[2rem] font-bold text-left">Giỏ hàng của bạn</h1>
        <div className="flex flex-col gap-4 pt-6 relative">
          {!isClient ? null : cart.items.length === 0 ? (
            <p className="text-center text-gray-500 mt-4">Giỏ hàng trống.</p>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="w-5 h-5 accent-black"
                />
                Chọn tất cả
              </div>

              <CartMobile
                cartItems={cart.items}
                totalPrice={totalPrice}
                onQuantityChange={handleQuantityChange}
                onToggleLike={toggleLike}
                onRemove={removeItem}
                productsActiveStatus={productsActiveStatus}
              />
              <CartDesktop
                cartItems={cart.items}
                totalPrice={totalPrice}
                onQuantityChange={handleQuantityChange}
                onToggleLike={toggleLike}
                onRemove={removeItem}
                productsActiveStatus={productsActiveStatus}
              />
              <div className="mb-4 mt-9">
                {isSuggestedLoading ? (
                  <div className="sk-chase" role="status" aria-label="Đang tải">
                    <div className="sk-chase-dot"></div>
                    <div className="sk-chase-dot"></div>
                    <div className="sk-chase-dot"></div>
                    <div className="sk-chase-dot"></div>
                    <div className="sk-chase-dot"></div>
                    <div className="sk-chase-dot"></div>
                  </div>
                ) : suggestedProducts.length > 0 ? (
                  <ProductSection
                    products={suggestedProducts}
                    desktopSlidesPerView={3.5}
                  />
                ) : (
                  <p className="text-center text-gray-500">
                    Không có sản phẩm gợi ý.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </Container>
    </div>
  );
}
