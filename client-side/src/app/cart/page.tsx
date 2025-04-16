// src/app/cart/page.tsx
"use client";
import ProductSection from "@/components/Home/ProductSection";
import Container from "@/components/Core/Container";
import { CartMobile, CartDesktop } from "@/components/Cart";
import { useCart, useCartDispatch } from "@/contexts/CartContext";
import { IProduct, ICartItem } from "@/types";
import { fetchProducts } from "@/services/api";

// Hàm fetch tĩnh để lấy sản phẩm gợi ý
async function getSuggestedProducts(): Promise<IProduct[]> {
  try {
    const products = await fetchProducts();
    return products || [];
  } catch {
    return [];
  }
}

export default async function Cart() {
  const cartItems = useCart();
  const dispatch = useCartDispatch();
  const products = await getSuggestedProducts();

  const totalPrice = cartItems.reduce(
    (sum, item) =>
      sum + item.price * (1 - item.discountPercent / 100) * item.quantity,
    0
  );

  const handleQuantityChange = (id: string, change: number) => {
    const item = cartItems.find((i) => i.id === id);
    if (!item) return;
    const newQuantity = Math.max(1, item.quantity + change);
    dispatch({
      type: "update",
      item: { ...item, quantity: newQuantity },
    });
  };

  const toggleLike = (id: string) => {
    const item = cartItems.find((i) => i.id === id);
    if (!item) return;
    dispatch({
      type: "update",
      item: { ...item, liked: !item.liked },
    });
  };

  const removeItem = (id: string) => {
    dispatch({ type: "delete", id });
  };

  return (
    <div className="py-8">
      <Container>
        <h1 className="text-2xl font-medium text-left">Giỏ hàng của bạn</h1>
        {cartItems.length === 0 ? (
          <p className="text-center text-gray-500 mt-4">Giỏ hàng trống.</p>
        ) : (
          <>
            <CartMobile
              cartItems={cartItems}
              totalPrice={totalPrice}
              onQuantityChange={handleQuantityChange}
              onToggleLike={toggleLike}
              onRemove={removeItem}
            />
            <CartDesktop
              cartItems={cartItems}
              totalPrice={totalPrice}
              onQuantityChange={handleQuantityChange}
              onToggleLike={toggleLike}
              onRemove={removeItem}
            />
            <div className="mb-4 mt-9">
              <ProductSection products={products} desktopSlidesPerView={5.5} />
            </div>
          </>
        )}
      </Container>
    </div>
  );
}