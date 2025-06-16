"use client";
import { useEffect, useState } from "react";
import AdminLayout from "@/admin/layouts/AdminLayout";
import OrderTableWrapper from "@/admin/components/Admin_Order/OrderTableWrapper";
import OrderBody from "@/admin/components/Admin_Order/OrderBody";
import { fetchAllOrders } from "@/services/orderApi";
import { Toaster } from "react-hot-toast";
import { Order } from "@/types/order";

// Khai báo STATUS đầy đủ
const STATUS = [
  { key: "pending", label: "Chưa giải quyết", color: "bg-[#FFF7DB] text-[#FFA800]" },
  { key: "processing", label: "Đang xử lý", color: "bg-[#E8F2FD] text-[#2998FF]" },
  { key: "confirming", label: "Chờ xác nhận", color: "bg-[#FFF7DB] text-[#FFA800]" },
  { key: "delivering", label: "Đang giao", color: "bg-[#DBF7E8] text-[#39C24F]" },
  { key: "success", label: "Hoàn thành", color: "bg-[#DBF7E8] text-[#449E3C]" },
  { key: "cancelled", label: "Đã huỷ", color: "bg-[#FFE1E1] text-[#F75555]" }
];

export default function OrderPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      setLoading(true);
      try {
        const response = await fetchAllOrders({ page: 1, limit: 100 });
        const mappedOrders: Order[] = response.data.map((order: any) => ({
          id: order._id || "Không xác định",
          user: {
            name: order.userId?.name || "Không xác định",
            email: order.userId?.email || "Không xác định"
          },
          total: order.totalPrice ?? null,
          date: order.date || order.createdAt?.slice(0, 10) || "Không xác định",
          products: Array.isArray(order.products)
            ? order.products.map((p: any) => ({
                productId: {
                  name: p.productId?.name || "Không xác định",
                  price: p.productId?.price ?? null,
                  image: p.productId?.image ?? []
                },
                quantity: p.quantity ?? null,
              }))
            : [],
          status: order.status || "pending"
        }));
        setOrders(mappedOrders);
      } catch (e) {
        setOrders([]);
      }
      setLoading(false);
    }
    loadOrders();
  }, []);

<<<<<<< HEAD
=======
  const navigationItems = [
    { label: "Đơn hàng", href: "/admin/order", filter: "Tất cả" },
    { label: "Đã huỷ", href: "/admin/order/cancelled", filter: "cancelled" },
    {
      label: "Chưa giải quyết",
      href: "/admin/order/pending",
      filter: "pending",
    },
    { label: "Hoàn thành", href: "/admin/order/completed", filter: "success" },
  ];

>>>>>>> 21d7035d588ae8679eb05d2093e92a1366d82c92
  return (
    <AdminLayout pageTitle="Đơn hàng" pageSubtitle="Quản lý các đơn hàng.">
      <Toaster position="top-right" />
      <div className="order-page w-full mx-auto h-full flex flex-col">
<<<<<<< HEAD
        {loading ? (
          <div className="text-center py-8 text-gray-500">Đang tải...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8 text-gray-400">Không có đơn hàng nào</div>
        ) : (
          <OrderTableWrapper orders={orders} STATUS={STATUS}>
            {(filteredOrders, pageData, paginProps) => (
              <>
                <OrderBody orders={pageData} STATUS={STATUS} />
                {paginProps.totalPage > 1 && (
                  <div className="flex justify-center mt-8">
                    <paginProps.Pagination />
                  </div>
                )}
              </>
            )}
          </OrderTableWrapper>
=======
        {isLoading ? (
          <div className="sk-chase">
            <div className="sk-chase-dot"></div>
            <div className="sk-chase-dot"></div>
            <div className="sk-chase-dot"></div>
            <div className="sk-chase-dot"></div>
            <div className="sk-chase-dot"></div>
            <div className="sk-chase-dot"></div>
          </div>
        ) : (
          <OrderTable
            initialOrders={orders}
            navigationItems={navigationItems}
          />
>>>>>>> 21d7035d588ae8679eb05d2093e92a1366d82c92
        )}
      </div>
    </AdminLayout>
  );
}
