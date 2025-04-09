// src/components/Cart/CartMobile.tsx
import CartItem from "./CartItem";

interface CartMobileProps {
  cartItems: any[];
  totalPrice: number;
  onQuantityChange: (id: string, change: number) => void;
  onToggleLike: (id: string) => void;
  onRemove: (id: string) => void;
}

export default function CartMobile({
  cartItems,
  totalPrice,
  onQuantityChange,
  onToggleLike,
  onRemove,
}: CartMobileProps) {
  return (
    <div className="desktop:hidden">
      <div className="grid grid-cols-1 gap-6 border-b-2 border-black mt-4">
        {cartItems.map((item) => (
          <CartItem
            key={item.id}
            item={item}
            onQuantityChange={onQuantityChange}
            onToggleLike={onToggleLike}
            onRemove={onRemove}
          />
        ))}
      </div>
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-[1rem] font-bold">Tổng tiền</span>
          <span className="text-[1rem] font-bold text-[#FF0000]">
            {totalPrice.toLocaleString("vi-VN")}₫
          </span>
        </div>
        <button className="w-full py-3 bg-black text-white text-[1rem] font-medium rounded-lg hover:bg-gray-800">
          Thanh toán
        </button>
      </div>
    </div>
  );
}