"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/admin/layouts/AdminLayout";
import OrderDetailForm from "@/admin/components/Admin_Order/OrderDetailForm";
import { fetchOrderById } from "@/services/orderApi";
import toast from "react-hot-toast";

export default function OrderDetailClientPage({ id }: { id: string }) {
  const [order, setOrder] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      try {
        const response = await fetchOrderById(id);
        setOrder({
          id: response._id,
          orderCode: response._id,
          purchaseDate: new Date(response.createdAt).toLocaleString("vi-VN"),
          customerEmail: response.userId?.email || "Không xác định",
          products: response.products.map((p: any) => ({
            name: p.productId?.name || "Không xác định",
            quantity: p.quantity,
          })),
          total: response.totalPrice || 0,
          status: response.status,
        });
      } catch (err: any) {
        console.error("Error fetching order:", err);
        setError(err.message || "Không thể tải chi tiết đơn hàng.");
        toast.error(err.message || "Không thể tải chi tiết đơn hàng.");
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [id]);

  return (
    <AdminLayout pageTitle={`Đơn hàng #${id}`} pageSubtitle="Chi tiết đơn hàng">
      {loading ? (
        <div className="sk-chase">
          <div className="sk-chase-dot"></div>
          <div className="sk-chase-dot"></div>
          <div className="sk-chase-dot"></div>
          <div className="sk-chase-dot"></div>
          <div className="sk-chase-dot"></div>
          <div className="sk-chase-dot"></div>
        </div>
      ) : error ? (
        <div className="text-center text-lg text-red-500">{error}</div>
      ) : (
        <OrderDetailForm order={order} />
      )}
    </AdminLayout>
  );
}
