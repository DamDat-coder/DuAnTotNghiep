// src/admin/components/OrderDetailForm.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface OrderDetail {
  id: string;
  orderCode: string;
  purchaseDate: string;
  customerEmail: string;
  products: string[];
  total: number;
  status: "Đã huỷ" | "Chưa giải quyết" | "Hoàn thành";
}

interface OrderDetailFormProps {
  order: OrderDetail;
}

export default function OrderDetailForm({ order: initialOrder }: OrderDetailFormProps) {
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tempStatus, setTempStatus] = useState<"Đã huỷ" | "Chưa giải quyết" | "Hoàn thành">(
    initialOrder.status
  );

  useEffect(() => {
    if (initialOrder) {
      setOrder(initialOrder);
      setTempStatus(initialOrder.status);
      setLoading(false);
    } else {
      setError("Không tìm thấy đơn hàng.");
      setLoading(false);
    }
  }, [initialOrder]);

  const handleStatusChange = async () => {
    try {
      // Giả lập cập nhật trạng thái
      setOrder((prev) => (prev ? { ...prev, status: tempStatus } : null));
      console.log("Cập nhật trạng thái thành công:", tempStatus);
      router.push("/admin/order");
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái:", err);
    }
  };

  if (loading) {
    return <div className="text-center text-lg">Đang tải...</div>;
  }

  if (error || !order) {
    return <div className="text-center text-lg text-red-500">{error || "Không tìm thấy đơn hàng."}</div>;
  }

  return (
    <div className="w-full h-full mx-auto bg-white rounded-[2.125rem] px-12 py-8">
      <h2 className="text-[2rem] font-bold mb-6 text-center">Chi tiết đơn hàng</h2>

      {/* Thông tin đơn hàng */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Cột bên trái */}
        <div className="space-y-4">
          <div>
            <label className="block text-lg font-medium text-gray-700">Mã đơn hàng</label>
            <p className="text-base text-gray-900">{order.orderCode}</p>
          </div>
          <div>
            <label className="block text-lg font-medium text-gray-700">Ngày mua hàng</label>
            <p className="text-base text-gray-900">{order.purchaseDate}</p>
          </div>
          <div>
            <label className="block text-lg font-medium text-gray-700">Email khách hàng</label>
            <p className="text-base text-gray-900">{order.customerEmail}</p>
          </div>
        </div>

        {/* Cột bên phải */}
        <div className="space-y-4">
          <div>
            <label className="block text-lg font-medium text-gray-700">Sản phẩm đã mua</label>
            <ul className="list-disc list-inside text-base text-gray-900">
              {order.products.map((product, index) => (
                <li key={index}>{product}</li>
              ))}
            </ul>
          </div>
          <div>
            <label className="block text-lg font-medium text-gray-700">Tổng tiền</label>
            <p className="text-base text-gray-900">{order.total.toLocaleString()} VNĐ</p>
          </div>
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Trạng thái</label>
            <div className="flex items-center gap-4">
              <select
                value={tempStatus}
                onChange={(e) =>
                  setTempStatus(e.target.value as "Đã huỷ" | "Chưa giải quyết" | "Hoàn thành")
                }
                className="w-[50%] p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-center appearance-none bg-white text-blue-600"
              >
                <option
                  value="Đã huỷ"
                  className="text-gray-700 hover:text-white hover:bg-black"
                  style={{
                    backgroundColor: tempStatus === "Đã huỷ" ? "#000" : "white",
                    color: tempStatus === "Đã huỷ" ? "white" : "black",
                  }}
                >
                  Đã huỷ
                </option>
                <option
                  value="Chưa giải quyết"
                  className="text-gray-700 hover:text-white hover:bg-black"
                  style={{
                    backgroundColor: tempStatus === "Chưa giải quyết" ? "#000" : "white",
                    color: tempStatus === "Chưa giải quyết" ? "white" : "black",
                  }}
                >
                  Chưa giải quyết
                </option>
                <option
                  value="Hoàn thành"
                  className="text-gray-700 hover:text-white hover:bg-black"
                  style={{
                    backgroundColor: tempStatus === "Hoàn thành" ? "#000" : "white",
                    color: tempStatus === "Hoàn thành" ? "white" : "black",
                  }}
                >
                  Hoàn thành
                </option>
              </select>
              <button
                onClick={handleStatusChange}
                className="px-4 py-2 bg-black text-white rounded-full hover:bg-white border-2 border-black hover:text-black transition-all duration-300 ease-linear"
              >
                Cập nhật trạng thái
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Nút hành động */}
      <div className="flex justify-center mt-8 gap-4">
        <button
          type="button"
          onClick={() => router.push("/admin/order")}
          className="px-6 py-2 w-full bg-gray-300 text-black font-semibold rounded-md hover:bg-gray-400 transition-colors"
        >
          Hủy
        </button>
      </div>
    </div>
  );
}