"use client";

import { useState } from "react";
import Image from "next/image";

export default function Checkout() {
  // Dữ liệu giả lập từ giỏ hàng
  const [orderItems] = useState([
    {
      id: 1,
      name: "MLB - Áo khoác phối mũ unisex Gopcore Basic",
      price: 5589000,
      discountPercent: 68,
      image: "/featured/featured_1.jpg",
      size: "XL",
      color: "Đen",
      quantity: 1,
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
    },
  ]);

  // Tính tổng tiền tạm thời (chưa có giảm giá hay phí vận chuyển)
  const subtotal = orderItems.reduce((total, item) => {
    const discountPrice = item.price * (1 - item.discountPercent / 100);
    return total + discountPrice * item.quantity;
  }, 0);

  // Giả lập mã giảm giá và phí vận chuyển
  const [discountCode, setDiscountCode] = useState("");
  const discount = 0; // Chưa áp dụng logic giảm giá, để 0 tạm thời
  const shippingFee = 30000; // Phí vận chuyển giả lập
  const total = subtotal - discount + shippingFee;

  const handleApplyDiscount = () => {
    // Logic áp dụng mã giảm giá (chưa triển khai)
    console.log("Mã giảm giá:", discountCode);
  };

  const renderOrderItem = (item: (typeof orderItems)[0]) => {
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
            {discountPrice.toLocaleString("vi-VN")}₫ x {item.quantity}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-5xl mx-auto">
        {/* Tiêu đề */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-medium">
            ĐƠN HÀNG ({orderItems.length} SẢN PHẨM)
          </h1>
          <span className="text-[1rem] font-bold">
            {subtotal.toLocaleString("vi-VN")}₫
          </span>
        </div>

        {/* Danh sách sản phẩm */}
        <div className="grid grid-cols-1 gap-6 border-b-2 border-black">
          {orderItems.map((item) => renderOrderItem(item))}
        </div>

        {/* Mã giảm giá */}
        <div className="mt-8">
          <label className="text-[1rem] font-medium">Mã giảm giá</label>
          <div className="flex mt-2">
            <input
              type="text"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              placeholder="Nhập mã giảm giá"
              className="w-full py-2 px-4 border border-gray-300 rounded-l-full focus:outline-none"
            />
            <button
              onClick={handleApplyDiscount}
              className="py-2 px-4 bg-black text-white font-medium rounded-r-full hover:bg-gray-800"
            >
              Áp Dụng
            </button>
          </div>
        </div>

        {/* Giá */}
        <div className="mt-8">
          <div className="border-b-2 border-black pb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[1rem]">Tạm tính</span>
              <span className="text-[1rem]">{subtotal.toLocaleString("vi-VN")}₫</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[1rem]">Giảm giá</span>
              <span className="text-[1rem]">{discount.toLocaleString("vi-VN")}₫</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[1rem]">Phí vận chuyển</span>
              <span className="text-[1rem]">{shippingFee.toLocaleString("vi-VN")}₫</span>
            </div>
          </div>
          <div className="flex justify-between items-center mt-4">
            <span className="text-[1rem] font-bold">THÀNH TIỀN:</span>
            <span className="text-[1rem] font-bold text-[#FF0000]">
              {total.toLocaleString("vi-VN")}₫
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}