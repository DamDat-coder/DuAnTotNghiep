"use client";
import { useEffect, useState } from "react";
import AdminLayout from "@/admin/layouts/AdminLayout";
import OrderTableWrapper from "@/admin/components/Admin_Order/OrderTableWrapper";
import { fetchAllOrders } from "@/services/orderApi";
import { Toaster } from "react-hot-toast";
import type { IOrder } from "@/types/order"; // Import type cho order

type StatusKey = "pending" | "confirmed" | "shipping" | "delivered" | "cancelled" | "fake";
interface StatusOption {
  key: StatusKey;
  label: string;
  color: string;
}
const STATUS: StatusOption[] = [
  { key: "pending", label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-500" },
  { key: "confirmed", label: "Đã xác nhận", color: "bg-blue-100 text-blue-500" },
  { key: "shipping", label: "Đang giao", color: "bg-green-100 text-green-600" },
  { key: "delivered", label: "Hoàn thành", color: "bg-emerald-100 text-emerald-500" },
  { key: "cancelled", label: "Đã huỷ", color: "bg-red-100 text-red-500" },
  { key: "fake", label: "Từ chối nhận hàng", color: "bg-gray-200 text-gray-600" }
];


export default function OrderPage() {
  const [orders, setOrders] = useState<IOrder[]>([]); // Khai báo type IOrder[]
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      setLoading(true);
      try {
        const response = await fetchAllOrders({ page: 1, limit: 100 });
        setOrders(response.data as IOrder[]); // Optional: as IOrder[] nếu data chắc chắn đúng type
      } catch (e) {
        setOrders([]);
      }
      setLoading(false);
    }
    loadOrders();
  }, []);

  return (
    <AdminLayout pageTitle="Đơn hàng" pageSubtitle="Quản lý các đơn hàng.">
      <Toaster position="top-right" />
      <div className="order-page w-full mx-auto h-full flex flex-col">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Đang tải...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8 text-gray-400">Không có đơn hàng nào</div>
        ) : (
          <OrderTableWrapper orders={orders} setOrders={setOrders} STATUS={STATUS} />
        )}
      </div>
    </AdminLayout>
  );
}
