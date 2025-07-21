"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import CancelOrderModal from "../modals/CancelOrderModal";
import { IOrder, OrderDetail } from "@/types/order";
import { fetchOrdersUser } from "@/services/orderApi";
import { fetchUser } from "@/services/userApi";
import { useCancelOrder } from "@/hooks/useCancelOrder";

interface OrderTabProps {
  setActiveTab: (tab: string) => void;
  setSelectedOrder: (order: OrderDetail) => void; // Updated to OrderDetail
}

export default function Orders({
  setActiveTab,
  setSelectedOrder,
}: OrderTabProps) {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<
    "all" | IOrder["status"]
  >("all");
  const router = useRouter();

  const {
    showCancelModal,
    orderToCancel,
    isCancelling,
    handleCancelOrder,
    openCancelModal,
    closeCancelModal,
  } = useCancelOrder(orders, setOrders);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const user = await fetchUser();
        if (!user || !user.id) {
          toast.error("Không thể lấy thông tin người dùng!");
          return;
        }
        const response = await fetchOrdersUser(user.id);
        if (response?.data) {
          setOrders(response.data);
          console.log("Fetched orders:", response.data);
        } else {
          setOrders([]);
        }
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
    { label: "Chờ xác nhận", value: "pending" },
    { label: "Đang xử lý", value: "confirmed" },
    { label: "Đang giao", value: "shipping" },
    { label: "Đã giao", value: "delivered" },
    { label: "Đã hủy", value: "cancelled" },
  ];

  const getStatusBadge = (status: IOrder["status"]) => {
    const baseStyle =
      "flex items-center justify-center w-[118px] h-[38px] text-[16px] rounded-[8px] font-medium";
    switch (status) {
      case "pending":
        return (
          <span className={`${baseStyle} bg-[#FFF4E5] text-[#FF9900]`}>
            Chờ xác nhận
          </span>
        );
      case "confirmed":
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
      case "delivered":
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
          <span className={`${baseStyle} bg-[#FDECEA] text-[#D93025]`}>
            Đã hủy
          </span>
        );
    }
  };

  const filteredOrders =
    selectedStatus === "all"
      ? orders
      : orders.filter((order) => order.status === selectedStatus);

  if (isLoading) {
    return (
      <div className="text-center py-10 text-gray-500 font-medium">
        Đang tải đơn hàng...
      </div>
    );
  }

  return (
    <div>
      <Toaster position="top-right" />
      <h1 className="text-xl font-semibold mb-6">ĐƠN HÀNG</h1>

      <div className="flex gap-6 border-b border-[#E0E0E0]">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            className={`pb-3 text-[16px] text-black transition-all duration-200 relative
              ${
                selectedStatus === tab.value
                  ? "font-bold border-b-2 border-black"
                  : "font-normal hover:text-gray-800"
              }`}
            onClick={() =>
              setSelectedStatus(tab.value as typeof selectedStatus)
            }
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="h-[1px] w-full bg-[#D1D1D1] mb-6" />

      {filteredOrders.length === 0 ? (
        <p className="text-center text-gray-500">Bạn chưa có đơn hàng nào.</p>
      ) : (
        <div className="flex flex-col items-center space-y-[16px]">
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              className="w-full bg-white rounded-[8px] shadow-custom-order p-6"
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
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                    : "N/A"}
                </p>
                <p>Tổng tiền: {order.totalPrice.toLocaleString("vi-VN")}₫</p>
                <p>
                  Thanh toán:{" "}
                  {order.paymentMethod
                    ? order.paymentMethod.toUpperCase()
                    : "Chưa thanh toán"}
                </p>
              </div>
              <div className="flex gap-3 w-[225px]">
                <button
                  onClick={() => {
                    setSelectedOrder(order as OrderDetail); // Cast to OrderDetail
                    setActiveTab("Chi tiết đơn hàng");
                    router.push(`/profile?tab=order/${order._id}`);
                  }}
                  className="w-[127px] h-[42px] border border-black rounded text-sm hover:bg-gray-100"
                >
                  Xem chi tiết
                </button>
                {(order.status === "pending") && (

                  <button
                    onClick={() => openCancelModal(order._id)}
                    className="w-[82px] h-[42px] bg-[#E74C3C] text-white text-sm rounded hover:bg-red-600"
                    disabled={isCancelling}
                  >
                    {isCancelling && orderToCancel === order._id
                      ? "Đang hủy..."
                      : "Hủy"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCancelModal && orderToCancel && (
        <CancelOrderModal
          orderId={orderToCancel}
          onClose={closeCancelModal}
          onConfirm={() => handleCancelOrder(orderToCancel)}
        />
      )}
    </div>
  );
}
