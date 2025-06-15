"use client";

import Image from "next/image";
import { OrderDetail as OrderType } from "@/types/order";

interface OrderDetailProps {
  order: OrderType;
  setActiveTab?: (tab: string) => void;
}

export default function OrderDetail({ order, setActiveTab }: OrderDetailProps) {
  return (
    <div className="w-[894px] mx-auto px-4 py-6 space-y-12">
      {/* Tiêu đề */}
      <h1 className="text-xl font-bold border-b pb-2">ĐƠN HÀNG</h1>

      {/* Header: Trở lại + Mã đơn + Trạng thái */}
      <div className="flex justify-between items-center text-sm">
        <button
          onClick={() => setActiveTab?.("Đơn hàng")}
          className="flex items-center gap-2 text-gray-600 font-medium"
        >
          <Image src="/profile/Back.svg" alt="back" width={6} height={10} />
          TRỞ LẠI
        </button>
        <div className="flex items-center gap-2 font-medium">
          <span>MÃ ĐƠN HÀNG: {order.orderCode}</span>
          <span>|</span>
          <span>ĐƠN HÀNG ĐÃ HOÀN THÀNH</span>
        </div>
      </div>

      {/* Danh sách sản phẩm */}
      <div className="space-y-6">
        {order.products.map((product, index) => (
          <div key={index} className="flex items-center gap-8 w-full">
            {/* Ảnh tạm hoặc placeholder */}
            <div className="w-[94px] h-[94px] bg-gray-100 rounded shrink-0" />

            <div className="flex justify-between items-center w-full">
              <div className="space-y-1">
                <p className="font-semibold">{product.name}</p>
                <p className="text-sm text-gray-600">SL: {product.quantity}</p>
              </div>
              <div className="text-[#FF0000] font-semibold text-sm whitespace-nowrap">
                {/* Không có giá nên để trống hoặc hiển thị "-" */}— ₫
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Địa chỉ nhận hàng */}
      <div className="text-base mb-6">
        <h2 className="text-[20px] font-bold mb-[24px]">ĐỊA CHỈ NHẬN HÀNG</h2>
        <div className="flex justify-between items-start gap-[18px]">
          <div className="w-[679px] space-y-[12px] leading-relaxed">
            <p>
              <strong>Tên người nhận:</strong> Mỹ Chi
            </p>
            <p>
              <strong>Số điện thoại người nhận:</strong> 0773237159
            </p>
            <p>
              <strong>Địa chỉ nhận hàng:</strong> 344/22, Đường Bà Điểm 4, Ấp
              Tiền Lân, Xã Bà Điểm, Huyện Hóc Môn, TP. Hồ Chí Minh
            </p>
            <p>
              <strong>Phương thức Thanh toán:</strong>{" "}
              <span className="uppercase">Đang cập nhật...</span>
            </p>
          </div>
          <div className="text-right whitespace-nowrap font-medium self-center">
            Giao Hàng Nhanh
          </div>
        </div>
      </div>

      <table className="w-full text-base text-black bg-[#F8FAFC] rounded overflow-hidden">
        <thead>
          <tr className="text-gray-500 text-[16px] h-[64px]">
            <th className="w-[223.5px] text-center align-middle">
              Tổng giá sản phẩm
            </th>
            <th className="w-[223.5px] text-center align-middle">Tiền ship</th>
            <th className="w-[223.5px] text-center align-middle">Giảm giá</th>
            <th className="w-[223.5px] text-center align-middle text-black">
              Tổng tiền
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="h-[64px] text-[15px] font-medium">
            <td className="text-center align-middle">1.250.000₫</td>
            <td className="text-center align-middle">15.000₫</td>
            <td className="text-center align-middle">0</td>
            <td className="text-center align-middle font-semibold">
              {order.total.toLocaleString("vi-VN")}₫
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
