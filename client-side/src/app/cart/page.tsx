"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart, Trash2 } from "lucide-react";

export default function Cart() {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "MLB - Áo khoác phối mũ unisex Gopcore Basic",
      price: 5589000,
      discountPercent: 68,
      image: "/featured/featured_1.jpg",
      size: "XL",
      color: "Đen",
      quantity: 1,
      liked: false,
    },
    {
      id: 2,
      name: "Áo thun unisex phong cách đường phố",
      price: 500000,
      discountPercent: 20,
      image: "/featured/featured_1.jpg",
      size: "M",
      color: "Trắng",
      quantity: 2,
      liked: true,
    },
  ]);

  const handleQuantityChange = (id: number, change: number) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const toggleLike = (id: number) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, liked: !item.liked } : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  // Tính tổng tiền
  const totalPrice = cartItems.reduce((total, item) => {
    const discountPrice = item.price * (1 - item.discountPercent / 100);
    return total + discountPrice * item.quantity;
  }, 0);

  const renderCartItem = (item: (typeof cartItems)[0]) => {
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
        <div className="flex-1 flex flex-col gap-2">
          <h3 className="text-lg font-semibold text-[#374151] line-clamp-2">
            {item.name}
          </h3>
          <div className="text-sm text-[#374151]">
            Size: {item.size} ({item.color})
          </div>
          <div className="text-[1rem] font-bold text-red-500">
            {discountPrice.toLocaleString("vi-VN")}₫
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 border border-gray-300 rounded-full w-fit">
              <button
                onClick={() => handleQuantityChange(item.id, -1)}
                className="w-8 h-8 flex items-center justify-center text-black"
              >
                -
              </button>
              <span className="w-8 h-8 flex items-center justify-center text-black">
                {item.quantity}
              </span>
              <button
                onClick={() => handleQuantityChange(item.id, 1)}
                className="w-8 h-8 flex items-center justify-center text-black"
              >
                +
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => toggleLike(item.id)}
                className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200"
              >
                <Heart
                  size={20}
                  fill={item.liked ? "red" : "none"}
                  stroke={item.liked ? "red" : "black"}
                />
              </button>
              <button
                onClick={() => removeItem(item.id)}
                className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200"
              >
                <Trash2 size={20} stroke="black" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-medium text-left">Giỏ hàng của bạn</h1>
        {cartItems.length === 0 ? (
          <p className="text-center text-gray-500">Giỏ hàng trống.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 border-b-2 border-black">
              {cartItems.map((item) => renderCartItem(item))}
            </div>

            {/* Phần Tổng tiền */}
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
          </>
        )}
      </div>
    </div>
  );
}