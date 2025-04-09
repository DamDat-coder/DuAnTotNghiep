// app/cart/page.tsx
"use client";

import ProductSection from "@/components/Home/ProductSection";
import Container from "@/components/Core/Container";
import { CartMobile, CartDesktop } from "@/components/Cart";
import { useCart } from "@/hooks";

export default function Cart() {
  const {
    cartItems,
    products,
    loading,
    error,
    handleQuantityChange,
    toggleLike,
    removeItem,
    totalPrice,
  } = useCart();

  if (loading) {
    return (
      <div className="py-8">
        <Container>
          <p className="text-center text-gray-500">Đang tải...</p>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8">
        <Container>
          <p className="text-center text-red-500">{error}</p>
        </Container>
      </div>
    );
  }

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
