"use client";

import Image from "next/image";

export default function OrderDetail() {
  return (
    <div className="space-y-6 px-4 py-6">
      <h1 className="text-xl font-bold border-b pb-2">ĐƠN HÀNG</h1>

      {/* Header thông tin */}
      <div className="flex justify-between items-center text-sm">
        <button className="flex items-center gap-2 text-gray-600">
          <span>&larr;</span> TRỞ LẠI
        </button>
        <div className="text-right">
          <p className="font-medium">MÃ ĐƠN HÀNG: 24011880Q5A25</p>
          <p className="text-green-600 font-semibold">ĐƠN HÀNG ĐÃ HOÀN THÀNH</p>
        </div>
      </div>

      {/* Sản phẩm */}
      <div className="flex justify-between border-b pb-4">
        <div className="flex gap-4">
          <div className="w-[80px] h-[100px] relative shrink-0">
            <Image
              src="/images/product.png"
              alt="product"
              fill
              className="object-contain"
            />
          </div>
          <div className="flex flex-col justify-between">
            <p className="font-semibold leading-snug">
              MLB – Áo khoác phối mũ unisex Gopcore Basic
            </p>
            <p className="text-sm text-gray-500 mt-1">SL: 1 Trắng/L</p>
          </div>
        </div>

        <div className="text-red-600 font-semibold text-sm whitespace-nowrap">
          1,790,000₫
        </div>
      </div>

      {/* Địa chỉ nhận hàng */}
      <div className="space-y-2">
        <h2 className="text-lg font-bold">ĐỊA CHỈ NHẬN HÀNG</h2>
        <p>
          <span className="font-semibold">Tên người nhận:</span> Mỹ Chi
        </p>
        <p>
          <span className="font-semibold">Số điện thoại người nhận:</span>{" "}
          0773273159
        </p>
        <p>
          <span className="font-semibold">Địa chỉ nhận hàng:</span> 344/22,
          Đường Bà Điểm 4, Ấp Tiền Lân, Xã Bà Điểm, Huyện Hóc Môn, TP. Hồ Chí
          Minh
          <span className="ml-4 font-medium">Giao Hàng Nhanh</span>
        </p>
        <p>
          <span className="font-semibold">Phương thức Thanh toán:</span> Thanh
          toán qua ví ZaloPay
        </p>
      </div>
    </div>
  );
}
