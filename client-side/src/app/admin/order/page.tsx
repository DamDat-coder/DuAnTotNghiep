"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/admin/layouts/AdminLayout";
import OrderTable from "@/admin/components/Admin_Order/OrderTable";
import { fetchAllOrders } from "@/services/api";
import toast, { Toaster } from "react-hot-toast";
import { Order } from "@/types";

export default function OrderPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const response = await fetchAllOrders({ page: 1, limit: 10 });
        const mappedOrders: Order[] = response.data.map((order: any) => ({
          id: order._id,
          user: {
            name: order.userId?.name || "Không xác định",
            email: order.userId?.email || "Không xác định",
          },
          total: order.totalPrice || 0,
          products: order.products.map((p: any) => ({
            productId: {
              name: p.productId?.name || "Không xác định",
              price: p.productId?.price || 0,
              image: p.productId?.image || [],
            },
            quantity: p.quantity,
          })),
          status: order.status,
        }));
        setOrders(mappedOrders);
      } catch (error) {
        toast.error("Không thể tải danh sách đơn hàng!");
        console.error("Error loading orders:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadOrders();
  }, []);

  const navigationItems = [
    { label: "Đơn hàng", href: "/admin/order", filter: "Tất cả" },
    { label: "Đã huỷ", href: "/admin/order/cancelled", filter: "cancelled" },
    { label: "Chưa giải quyết", href: "/admin/order/pending", filter: "pending" },
    { label: "Hoàn thành", href: "/admin/order/completed", filter: "success" },
  ];

  return (
    <AdminLayout pageTitle="Đơn hàng" pageSubtitle="Quản lý các đơn hàng.">
      <Toaster position="top-right" />
      <div className="order-page w-full mx-auto h-full flex flex-col">
        {isLoading ? (
          <p className="text-center text-gray-500">Đang tải...</p>
        ) : (
          <OrderTable initialOrders={orders} navigationItems={navigationItems} />
        )}
      </div>
    </AdminLayout>
  );
}