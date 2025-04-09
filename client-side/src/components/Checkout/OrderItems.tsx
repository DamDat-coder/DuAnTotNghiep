// src/components/OrderItems.tsx
import Image from "next/image";
import { OrderItem } from "@/types";

interface OrderItemsProps {
  orderItems: OrderItem[];
}

export default function OrderItems({ orderItems }: OrderItemsProps) {
  const renderOrderItem = (item: OrderItem) => {
    const discountPrice = item.price * (1 - item.discountPercent / 100);
    return (
      <div key={item.id} className="flex items-center gap-4 p-4">
        <Image
          src={item.image}
          alt={item.name}
          width={110}
          height={110}
          className="w-[6.9rem] h-[6.9rem] object-cover rounded"
        />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-[#374151] line-clamp-2">
            {item.name}
          </h3>
          <div className="text-sm text-[#374151]">
            Size: {item.size} ({item.color}) - Số lượng: {item.quantity}
          </div>
          <div className="text-[1rem] font-bold text-red-500">
            {(discountPrice * item.quantity).toLocaleString("vi-VN")}₫
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mb-6">
      <h1 className="text-lg font-bold">
        ĐƠN HÀNG ({orderItems.length} SẢN PHẨM)
      </h1>
      <div className="grid grid-cols-1 gap-6 mt-4">
        {orderItems.map((item) => renderOrderItem(item))}
      </div>
    </div>
  );
}