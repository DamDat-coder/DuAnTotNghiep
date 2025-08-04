"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/admin/layouts/AdminLayout";
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
          products: response.products?.map((p: any) => ({
            name: p.productId?.name || "Không xác định",
            quantity: p.quantity,
          })) || [],
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
        // Tùy bạn render lại chi tiết đơn hàng ở đây, ví dụ tạm thời:
        <div className="p-6 bg-white rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-4">Thông tin đơn hàng</h2>
          <div><b>Mã đơn:</b> {order.id}</div>
          <div><b>Ngày mua:</b> {order.purchaseDate}</div>
          <div><b>Email khách:</b> {order.customerEmail}</div>
          <div><b>Trạng thái:</b> {order.status}</div>
          <div><b>Tổng tiền:</b> {order.total.toLocaleString()} đ</div>
          <div className="mt-2"><b>Sản phẩm:</b></div>
          <ul>
            {order.products.map((p: any, i: number) => (
              <li key={i}>
                {p.name} x {p.quantity}
              </li>
            ))}
          </ul>
        </div>
      )}
    </AdminLayout>
  );
}
