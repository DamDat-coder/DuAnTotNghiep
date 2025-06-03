"use client";

import Image from "next/image";

const orders = [
  {
    id: 1,
    name: "MLB – Áo khoác phối mũ unisex Gopcore Basic",
    img: "/images/product.png", // đường dẫn ảnh
    quantity: "1 Trắng/L",
    status: "ĐÃ HOÀN THÀNH",
    price: "1,790,000₫",
  },
  {
    id: 2,
    name: "MLB – Áo khoác phối mũ unisex Gopcore Basic",
    img: "/images/product.png",
    quantity: "1 Trắng/L",
    status: "ĐÃ HOÀN THÀNH",
    price: "1,790,000₫",
  },
  {
    id: 3,
    name: "MLB – Áo khoác phối mũ unisex Gopcore Basic",
    img: "/images/product.png",
    quantity: "1 Trắng/L",
    status: "ĐÃ HỦY",
    price: "1,790,000₫",
  },
  {
    id: 4,
    name: "MLB – Áo khoác phối mũ unisex Gopcore Basic",
    img: "/images/product.png",
    quantity: "1 Trắng/L",
    status: "ĐÃ HOÀN THÀNH",
    price: "1,790,000₫",
  },
];

export default function OrderTab() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold border-b pb-2">ĐƠN HÀNG</h1>

      {orders.map((order) => (
        <div
          key={order.id}
          className="flex items-center justify-between border-b pb-4"
        >
          <div className="flex gap-4">
            <div className="w-[80px] h-[100px] relative shrink-0">
              <Image
                src={order.img}
                alt={order.name}
                fill
                className="object-contain"
              />
            </div>

            <div className="flex flex-col justify-between">
              <p className="font-semibold leading-snug">{order.name}</p>
              <p className="text-sm text-gray-500 mt-1">SL: {order.quantity}</p>
              <p
                className={`text-sm font-semibold mt-1 ${
                  order.status === "ĐÃ HỦY" ? "text-red-500" : "text-green-600"
                }`}
              >
                {order.status}
              </p>
            </div>
          </div>

          <div className="text-red-600 font-semibold text-sm">
            {order.price}
          </div>
        </div>
      ))}
    </div>
  );
}
