"use client";
import React, { useState, useEffect } from "react";
import { fetchOrderById, updateOrderStatus } from "@/services/orderApi";

type StatusOption = { key: string; label: string; color: string };

export default function EditOrderForm({
  orderId,
  onClose,
  setOrders,
  STATUS,
}: {
  orderId: string;
  onClose: () => void;
  setOrders: React.Dispatch<React.SetStateAction<any[]>>;
  STATUS: StatusOption[];
}) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!orderId) return;
    setLoading(true);
    fetchOrderById(orderId)
      .then((res) => {
        const data = res.data;
        setOrder(data);
        setStatus(data.status); // Luôn set về đúng trạng thái thực tế
      })
      .catch(() => {
        alert("Không tìm thấy đơn hàng hoặc lỗi API");
        onClose();
      })
      .finally(() => setLoading(false));
  }, [orderId, onClose]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    return `${String(d.getDate()).padStart(2, "0")}.${
      String(d.getMonth() + 1).padStart(2, "0")
    }.${d.getFullYear()}`;
  };

  const formatAddress = (addr: any) => {
    if (!addr) return "";
    const { street, ward, district, province } = addr;
    return [street, ward, district, province, "Việt Nam"]
      .filter((x) => x && x.trim())
      .join(", ");
  };

  // Lọc trạng thái hợp lệ
  const getAvailableStatus = (currentStatusKey: string) => {
    if (["delivered", "cancelled", "fake"].includes(currentStatusKey)) {
      return STATUS.filter((s) => s.key === currentStatusKey);
    }
    const currentStatusIndex = STATUS.findIndex((s) => s.key === currentStatusKey);
    return STATUS.filter(
      (s, idx) =>
        s.key === currentStatusKey ||  // luôn giữ trạng thái hiện tại trong options!
        idx === currentStatusIndex + 1 ||
        s.key === "cancelled"
    );
  };

  // Cập nhật trạng thái chỉ trên FE, không reload!
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      // Nếu chọn fake thì gửi cancelled
      const sendStatus = status === "fake" ? "cancelled" : status;
      await updateOrderStatus(orderId, sendStatus);
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          (order._id === orderId || order.id === orderId)
            ? { ...order, status: sendStatus }
            : order
        )
      );
      onClose();
    } finally {
      setUpdating(false);
    }
  };

  if (loading || !order) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-8"
        onClick={onClose}
      >
        <div
          className="p-6 bg-white rounded-xl shadow text-center"
          onClick={(e) => e.stopPropagation()}
        >
          Đang tải đơn hàng...
        </div>
      </div>
    );
  }

  const user = order.userId || {};
  const shippingFee = order.shipping ?? order.paymentId?.order_info?.shippingFee ?? 0;
  const paymentMethod = order.paymentMethod ?? order.paymentId?.method ?? "";

  // Lấy danh sách trạng thái hợp lệ cho form
  const availableStatus = getAvailableStatus(order.status);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center px-4 py-8"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-xl shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-h-[90vh] overflow-y-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Sửa đơn hàng</h2>
            <button
              className="text-gray-400 hover:bg-gray-100 rounded-full p-2"
              onClick={onClose}
            >
              <svg height="20" width="20" viewBox="0 0 20 20">
                <path
                  d="M10 8.586l4.95-4.95a1 1 0 1 1 1.414 1.415L11.414 10l4.95 4.95a1 1 0 0 1-1.415 1.414L10 11.414l-4.95 4.95A1 1 0 1 1 3.636 14.95L8.586 10l-4.95-4.95A1 1 0 1 1 5.05 3.636L10 8.586z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleUpdate}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Mã đơn hàng
                </label>
                <input
                  className="w-full bg-gray-100 px-4 py-2 outline-none rounded-l-xl"
                  value={order._id}
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Ngày đặt hàng
                </label>
                <input
                  className="w-full bg-gray-100 px-4 py-2 outline-none rounded-r-xl"
                  value={formatDate(order.createdAt)}
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tên người mua
                </label>
                <input
                  className="w-full bg-gray-100 px-4 py-2 outline-none rounded-l-xl"
                  value={user.name || ""}
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Số điện thoại người mua
                </label>
                <input
                  className="w-full bg-gray-100 px-4 py-2 outline-none rounded-r-xl"
                  value={user.phone || ""}
                  disabled
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Email người mua
              </label>
              <input
                className="w-full bg-gray-100 rounded-xl px-4 py-2 outline-none"
                value={user.email || ""}
                disabled
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Địa chỉ
              </label>
              <textarea
                className="w-full bg-gray-100 rounded-xl px-4 py-2 outline-none"
                rows={2}
                value={formatAddress(order.shippingAddress)}
                disabled
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tổng tiền
                </label>
                <input
                  className="w-full bg-gray-100 px-4 py-2 outline-none rounded-l-xl"
                  value={
                    order.totalPrice
                      ? `${order.totalPrice.toLocaleString()} đ`
                      : ""
                  }
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tiền ship
                </label>
                <input
                  className="w-full bg-gray-100 px-4 py-2 outline-none rounded-r-xl"
                  value={
                    shippingFee ? `${shippingFee.toLocaleString()} đ` : ""
                  }
                  disabled
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Thanh toán qua
              </label>
              <input
                className="w-full bg-gray-100 rounded-xl px-4 py-2 outline-none"
                value={paymentMethod}
                disabled
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Trạng thái <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full bg-gray-100 rounded-xl px-4 py-2 outline-none"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                required
                disabled={["delivered", "cancelled", "fake"].includes(order.status)}
              >
                {availableStatus.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-2 font-medium">Sản phẩm</div>
            <div className="rounded-xl bg-gray-50 mb-4">
              <div className="grid grid-cols-6 gap-2 text-gray-500 text-sm py-2 px-4 border-b border-gray-100">
                <div className="col-span-3">Tên sản phẩm</div>
                <div>Màu</div>
                <div>Size</div>
                <div>SL</div>
              </div>
              {(order.items || []).map((prod: any, idx: number) => (
                <div
                  key={idx}
                  className="grid grid-cols-6 gap-2 py-2 px-4 items-center border-b border-gray-100"
                >
                  <div className="col-span-3 font-medium">{prod.name}</div>
                  <div>{prod.color}</div>
                  <div>{prod.size}</div>
                  <div>{prod.quantity}</div>
                </div>
              ))}
            </div>
            <button
              type="submit"
              className="w-full bg-black hover:bg-gray-900 text-white rounded-xl py-3 mt-4 font-semibold transition disabled:opacity-70"
              disabled={updating || ["delivered", "cancelled", "fake"].includes(order.status)}
            >
              {updating ? "Đang lưu..." : "Cập nhật đơn hàng"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
