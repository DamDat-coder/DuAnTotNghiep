"use client";

import { useState, useEffect } from "react";
import { API_BASE_URL, fetchWithAuth } from "@/services/api";
import toast, { Toaster } from "react-hot-toast";
import CancelOrderModal from "../modals/CancelOrderModal";

interface Order {
  _id: string;
  createdAt: string;
  status: "pending" | "processing" | "shipping" | "success" | "cancelled";
  totalPrice: number;
  shippingAddress: string;
  couponId?: string;
  userId: string;
  products: {
    productId: {
      _id: string;
      name: string;
      price: number;
      image: string[];
    };
    quantity: number;
  }[];
  paymentMethod?: string;
}

interface OrderTabProps {
  setActiveTab: (tab: string) => void;
  setSelectedOrder: (order: any) => void;
}

export default function Orders({
  setActiveTab,
  setSelectedOrder,
}: OrderTabProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await fetchWithAuth<{ data: Order[] }>(
          `${API_BASE_URL}/order/user/orders`,
          { cache: "no-store" }
        );
        setOrders(response.data);
      } catch (error) {
        toast.error("Không thể tải danh sách đơn hàng!");
        console.error("Error fetching orders:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const statusTabs = [
    { label: "Tất cả", value: "all" },
    { label: "Đã giao", value: "success" },
    { label: "Đang giao", value: "shipping" },
    { label: "Đang xử lý", value: "processing" },
    { label: "Chờ xác nhận", value: "pending" },
    { label: "Đã hủy", value: "cancelled" },
  ];

  const getStatusBadge = (status: string) => {
    const baseStyle =
      "flex items-center justify-center w-[118px] h-[38px] text-[16px] rounded-[8px] font-medium";
    switch (status) {
      case "pending":
        return (
          <span className={`${baseStyle} bg-[#FFF4E5] text-[#FF9900]`}>
            Chờ xác nhận
          </span>
        );
      case "processing":
        return (
          <span className={`${baseStyle} bg-[#E5F6FD] text-[#007BFF]`}>
            Đang xử lý
          </span>
        );
      case "shipping":
        return (
          <span className={`${baseStyle} bg-[#E6F4EA] text-[#28A745]`}>
            Đang giao
          </span>
        );
      case "success":
        return (
          <span className={`${baseStyle} bg-[#EDF7ED] text-[#2E7D32]`}>
            Đã giao
          </span>
        );
      case "cancelled":
        return (
          <span className={`${baseStyle} bg-[#FDECEA] text-[#D93025]`}>
            Đã hủy
          </span>
        );
      default:
        return (
          <span className={`${baseStyle} bg-gray-300 text-black`}>
            Không xác định
          </span>
        );
    }
  };

  if (isLoading) {
    return <p className="text-center text-gray-500 mt-4">Đang tải...</p>;
  }

  const filteredOrders = orders.filter((order) =>
    selectedStatus === "all" ? true : order.status === selectedStatus
  );

  return (
    <div>
      <Toaster position="top-right" />
      <h1 className="text-xl font-semibold mb-4">ĐƠN HÀNG</h1>

      <div className="flex flex-wrap gap-4 mb-8">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            className={`px-4 py-2 rounded-lg border ${
              selectedStatus === tab.value
                ? "bg-black text-white"
                : "bg-white text-black"
            }`}
            onClick={() => setSelectedStatus(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <p className="text-center text-gray-500">Bạn chưa có đơn hàng nào.</p>
      ) : (
        <div className="flex flex-col items-center space-y-[16px]">
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              className="w-[894px] bg-white rounded-[8px] shadow-custom-order p-6"
            >
              <div className="flex justify-between items-start mb-[16px]">
                <p className="font-bold text-sm text-black">
                  MÃ ĐƠN HÀNG: {order._id}
                </p>
                {getStatusBadge(order.status)}
              </div>
              <div className="space-y-1 text-sm text-gray-700 mb-[16px]">
                <p>
                  Ngày đặt:{" "}
                  {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                </p>
                <p>Tổng tiền: {order.totalPrice.toLocaleString("vi-VN")}₫</p>
                <p>
                  Thanh toán:{" "}
                  {order.paymentMethod?.toUpperCase() || "Chưa thanh toán"}
                </p>
              </div>
              <div className="flex gap-3 w-[225px]">
                <button
                  onClick={() => {
                    setSelectedOrder({
                      id: order._id,
                      orderCode: order._id,
                      purchaseDate: new Date(
                        order.createdAt
                      ).toLocaleDateString("vi-VN"),
                      customerEmail: order.userId,
                      products: order.products.map((p) => ({
                        name: p.productId.name,
                        quantity: p.quantity,
                      })),
                      total: order.totalPrice,
                      status: order.status,
                    });
                    setActiveTab("Chi tiết đơn hàng");
                  }}
                  className="w-[127px] h-[42px] border border-black rounded text-sm hover:bg-gray-100"
                >
                  Xem chi tiết
                </button>

                {(order.status === "pending" ||
                  order.status === "processing") && (
                  <button
                    onClick={() => {
                      setOrderToCancel(order._id);
                      setShowCancelModal(true);
                    }}
                    className="w-[82px] h-[42px] bg-[#E74C3C] text-white text-sm rounded hover:bg-red-600"
                  >
                    Hủy
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCancelModal && (
        <CancelOrderModal
          onClose={() => setShowCancelModal(false)}
          onConfirm={() => {
            console.log("Hủy đơn:", orderToCancel);
            setShowCancelModal(false);
            toast.success("Đã gửi yêu cầu hủy đơn hàng.");
          }}
        />
      )}
    </div>
  );
}
