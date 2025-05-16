"use client";

import { useState, useEffect, useMemo } from "react";
import Container from "@/components/Core/Container";
import { CartMobile, CartDesktop } from "@/components/Cart";
import ProductSection from "@/components/Home/ProductSection";
import { useCart, useCartDispatch } from "@/contexts/CartContext";
import { IProduct, ICartItem } from "@/types";
import { fetchProducts } from "@/services/productApi";

export default function Cart() {
  const cart = useCart();
  const dispatch = useCartDispatch();
  const [suggestedProducts, setSuggestedProducts] = useState<IProduct[]>([]);

  // Fetch suggested products on mount
  useEffect(() => {
    async function getSuggestedProducts() {
      try {
        const products = await fetchProducts();
        console.log("Fetched suggested products:", products);
        setSuggestedProducts(products || []);
      } catch (error) {
        console.error("Failed to fetch suggested products:", error);
        setSuggestedProducts([]);
      }
    }
    getSuggestedProducts();
  }, []);

  const totalPrice = useMemo(
    () => cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
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

  const removeItem = (id: string, size: string) => {
    const item = cart.items.find((i) => i.id === id && i.size === size);
    if (!item) return;
    dispatch({ type: "delete", item });
  };

  return (
    <div className="py-8">
      <Container>
        <h1 className="text-2xl font-medium text-left">Giỏ hàng của bạn</h1>
        {cart.items.length === 0 ? (
          <p className="text-center text-gray-500 mt-4">Giỏ hàng trống.</p>
        ) : (
          <>
            <CartMobile
              cartItems={cart.items}
              totalPrice={totalPrice}
              onQuantityChange={handleQuantityChange}
              onToggleLike={toggleLike}
              onRemove={removeItem}
            />
            <CartDesktop
              cartItems={cart.items}
              totalPrice={totalPrice}
              onQuantityChange={handleQuantityChange}
              onToggleLike={toggleLike}
              onRemove={removeItem}
            />
            <div className="mb-4 mt-9">
              {suggestedProducts.length > 0 ? (
                <ProductSection products={suggestedProducts} desktopSlidesPerView={3.5} />
              ) : (
                <p className="text-center text-gray-500">Không có sản phẩm gợi ý.</p>
              )}
            </div>
          </>
        )}
      </Container>
    </div>
  );
}