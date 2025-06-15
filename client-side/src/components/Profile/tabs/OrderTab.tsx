"use client";

import { useState, useEffect } from "react";
import Container from "@/components/Core/Container";
import { API_BASE_URL, fetchWithAuth } from "@/services/api";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
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
  setSelectedOrderId: (id: string) => void;
  setSelectedPaymentMethod: (method: string) => void;
}

export default function Orders({
  setActiveTab,
  setSelectedOrderId,
  setSelectedPaymentMethod,
}: OrderTabProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState("all");

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

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const statusTabs = [
    { label: "Tất cả", value: "all" },
    { label: "Đã giao", value: "success" },
    { label: "Đang giao", value: "shipping" },
    { label: "Đang xử lý", value: "processing" },
    { label: "Chờ xác nhận", value: "pending" },
    { label: "Đã hủy", value: "cancelled" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="bg-[#FFF4E5] text-[#FF9900] text-sm px-4 py-[6px] rounded">
            Chờ xác nhận
          </span>
        );
      case "processing":
        return (
          <span className="bg-[#E5F6FD]] text-[#007BFF] text-xs px-2 py-1 rounded">
            Đang xử lý
          </span>
        );
      case "shipping":
        return (
          <span className="bg-[#E6F4EA] text-[#28A745] text-xs px-2 py-1 rounded">
            Đang giao
          </span>
        );
      case "success":
        return (
          <span className="bg-[#EDF7ED] text-[#2E7D32] text-xs px-2 py-1 rounded">
            Đã giao
          </span>
        );
      case "cancelled":
        return (
          <span className="bg-[#FDECEA] text-[#D93025] text-xs px-2 py-1 rounded">
            Đã hủy
          </span>
        );
      default:
        return (
          <span className="bg-gray-300 text-black text-xs px-2 py-1 rounded">
            Không xác định
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="sk-chase">
        <div className="sk-chase-dot"></div>
        <div className="sk-chase-dot"></div>
        <div className="sk-chase-dot"></div>
        <div className="sk-chase-dot"></div>
        <div className="sk-chase-dot"></div>
        <div className="sk-chase-dot"></div>
      </div>
    );
  }
  const filteredOrders = orders.filter((order) =>
    selectedStatus === "all" ? true : order.status === selectedStatus
  );

  return (
    <div>
      <Toaster position="top-right" />
      <h1 className="text-xl font-semibold mb-4">ĐƠN HÀNG</h1>
      {/* Tabs lọc trạng thái */}
      <div className="relative my-8">
        {/* Tabs */}
        <div className="flex gap-8 pb-2 relative z-10">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedStatus(tab.value)}
              className={`relative pb-1 text-sm font-medium transition-all ${
                selectedStatus === tab.value
                  ? "text-black font-bold"
                  : "text-gray-500"
              }`}
            >
              {tab.label}
              {/* Gạch dưới cho tab active */}
              {selectedStatus === tab.value && <span />}
            </button>
          ))}
        </div>

        {/* Line kéo dài toàn chiều ngang container */}
        <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#d1d1d1] z-0" />
      </div>
      <div className="flex flex-col gap-4">
        {orders.length === 0 ? (
          <p className="text-center text-gray-500">Bạn chưa có đơn hàng nào.</p>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order._id}
              className="shadow-custom-order rounded-lg bg-white p-4 relative"
            >
              <div className="absolute top-4 right-4">
                {getStatusBadge(order.status)}
              </div>

              <div className="space-y-4">
                <p className="font-bold text-sm">MÃ ĐƠN HÀNG: {order._id}</p>
                <p className="text-sm text-gray-700">
                  Ngày đặt:{" "}
                  {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                </p>
                <p className="text-sm text-gray-700">
                  Tổng tiền: {order.totalPrice.toLocaleString("vi-VN")}₫
                </p>
                <p className="text-sm text-gray-700">
                  Thanh toán:{" "}
                  <span className="uppercase">
                    {order.paymentMethod || "Chưa thanh toán"}
                  </span>
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setSelectedOrderId(order._id);
                      setSelectedPaymentMethod(order.paymentMethod ?? "");
                      setActiveTab("Chi tiết đơn hàng");
                    }}
                    className="px-4 py-1 border border-black text-sm rounded hover:bg-gray-100"
                  >
                    <div className="cursor-pointer">Xem chi tiết</div>
                  </button>

                  {(order.status === "pending" ||
                    order.status === "processing") && (
                    <button className="px-4 py-1 bg-[#E74C3C] text-white text-sm rounded hover:bg-red-600">
                      Hủy
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
