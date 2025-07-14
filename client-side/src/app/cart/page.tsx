"use client";

import { useState, useEffect, useMemo } from "react";
import Container from "@/components/Core/Container";
import { CartMobile, CartDesktop } from "@/components/Cart";
import ProductSection from "@/components/Home/ProductSection/ProductSection";
import { useCart, useCartDispatch } from "@/contexts/CartContext";
import { IProduct } from "@/types/product";
import { fetchProducts } from "@/services/productApi";
import CartTablet from "@/components/Cart/CartTablet";
import { Toaster } from "react-hot-toast";

export default function Cart() {
  const cart = useCart();
  const dispatch = useCartDispatch();
  const [suggestedProducts, setSuggestedProducts] = useState<IProduct[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Đồng bộ checkbox "Chọn tất cả"
  useEffect(() => {
    setSelectAll(
      cart.items.length > 0 && cart.items.every((item) => item.selected)
    );
  }, [cart.items]);

  // Tổng tiền các sản phẩm được chọn (selected: true)
  const totalPrice = useMemo(
    () =>
      cart.items
        .filter((item) => item.selected)
        .reduce(
          (sum, item) =>
            sum +
            item.price * (1 - item.discountPercent / 100) * item.quantity,
          0
        ),
    [cart.items]
  );

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    cart.items.forEach((item) => {
      dispatch({
        type: "update",
        item: { ...item, selected: newSelectAll },
      });
    });
  };

  // Lấy sản phẩm chưa được chọn
  const unselectedItems = useMemo(
    () => cart.items.filter((item) => !item.selected),
    [cart.items]
  );

  const handleQuantityChange = (id: string, size: string, change: number) => {
    const item = cart.items.find((i) => i.id === id && i.size === size);
    if (!item) return;
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

  // Gợi ý sản phẩm
  useEffect(() => {
    async function getSuggestedProducts() {
      try {
        const response = await fetchProducts({ is_active: true });
        setSuggestedProducts(response.data || []);
      } catch (error) {
        console.error("Failed to fetch suggested products:", error);
        setSuggestedProducts([]);
      }
    }
    getSuggestedProducts();
  }, []);

  return (
    <div className="py-8">
      <Container>
        <Toaster position="top-right" />
        <h1 className="text-[2rem] font-bold text-left">Giỏ hàng của bạn</h1>
        <div className="flex flex-col gap-4 pt-6 relative">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={handleSelectAll}
              className="w-5 h-5 accent-black"
            />
            Chọn tất cả
          </div>

          {!isClient ? null : unselectedItems.length === 0 ? (
            <p className="text-center text-gray-500 mt-4">Giỏ hàng trống.</p>
          ) : (
            <>
              <CartMobile
                cartItems={unselectedItems}
                totalPrice={totalPrice}
                onQuantityChange={handleQuantityChange}
                onToggleLike={toggleLike}
                onRemove={removeItem}
              />
              <CartTablet
                cartItems={unselectedItems}
                totalPrice={totalPrice}
                onQuantityChange={handleQuantityChange}
                onToggleLike={toggleLike}
                onRemove={removeItem}
              />
              <CartDesktop
                cartItems={unselectedItems}
                totalPrice={totalPrice}
                onQuantityChange={handleQuantityChange}
                onToggleLike={toggleLike}
                onRemove={removeItem}
              />
              <div className="mb-4 mt-9">
                {suggestedProducts.length > 0 ? (
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
