"use client";

import Image from "next/image";
interface OrderDetailProps {
  orderId: string;
  paymentMethod?: string;
  setActiveTab?: (tab: string) => void;
}

export default function OrderDetail({
  orderId,
  setActiveTab,
  paymentMethod,
}: OrderDetailProps) {
  return (
    <div className="space-y-6 px-4 py-6">
      {/* Tiêu đề */}
      <h1 className="text-xl font-bold border-b pb-2">ĐƠN HÀNG</h1>

      {/* Header: Trở lại + Mã đơn hàng + Trạng thái */}
      <div className="flex justify-between items-center text-sm">
        <button
          onClick={() => {
            if (setActiveTab) setActiveTab("Đơn hàng");
          }}
          className="flex items-center gap-2 text-gray-600 font-medium"
        >
          <span className="text-lg">
            <Image src="/profile/Back.svg" alt="back" width={6} height={10} />
          </span>
          TRỞ LẠI
        </button>

        <div className="text-sm flex items-center gap-2">
          <span className="font-medium">MÃ ĐƠN HÀNG: {orderId}</span>
          <span className="text-black">|</span>
          <span className="text-black">ĐƠN HÀNG ĐÃ HOÀN THÀNH</span>
        </div>
      </div>

      {/* Sản phẩm */}
      <div className="flex border-b pb-4 gap-4 items-center">
        {/* Bên trái: hình và thông tin */}
        <div className="flex gap-4 flex-1">
          <div className="w-[180px] h-[141px] relative shrink-0">
            <Image
              src="/images/product.png"
              alt="product"
              fill
              className="object-contain rounded"
            />
          </div>
          <div className="flex flex-col justify-evenly">
            <p className="font-semibold leading-snug">
              MLB – Áo khoác phối mũ unisex Gopcore Basic
            </p>
            <p className="text-sm text-gray-600 mt-1">SL: 1 &nbsp; Trắng/L</p>
          </div>
        </div>

        {/* Bên phải: giá */}
        <div className="text-[#FF0000] font-semibold text-sm whitespace-nowrap">
          1,790,000₫
        </div>
      </div>

      {/* Địa chỉ nhận hàng */}
      <div className="space-y-2 text-sm">
        <h2 className="text-[24px] font-bold mb-[14px]">ĐỊA CHỈ NHẬN HÀNG</h2>

        <div className="ml-6 space-y-3">
          <p>
            <span>Tên người nhận:</span> Mỹ Chi
          </p>
          <p>
            <span>Số điện thoại người nhận:</span> 0773273159
          </p>
          <p className="leading-relaxed">
            <span>Địa chỉ nhận hàng:</span> 344/22, Đường Bà Điểm 4, Ấp Tiền
            Lân, Xã Bà Điểm, Huyện Hóc Môn, TP. Hồ Chí Minh
            <span className="ml-4 font-medium">Giao Hàng Nhanh</span>
          </p>
          <p>
            <span>Phương thức Thanh toán:</span>{" "}
            <span className="uppercase">
              {paymentMethod || "Đang cập nhật"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
