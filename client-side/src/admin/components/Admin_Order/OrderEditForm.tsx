"use client";
import React, { useState, useEffect } from "react";
import { fetchOrderById, updateOrderStatus } from "@/services/orderApi";
import toast from "react-hot-toast";
import Image from "next/image";

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
        setStatus(data.status);
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
    return `${String(d.getDate()).padStart(2, "0")}.${String(
      d.getMonth() + 1
    ).padStart(2, "0")}.${d.getFullYear()}`;
  };

  const formatAddress = (addr: any) => {
    if (!addr) return "";
    const { street, ward, province } = addr;
    return [street, ward, province, "Việt Nam"]
      .filter((x) => x && String(x).trim())
      .join(", ");
  };

  const getAvailableStatus = (currentStatusKey: string) => {
    // Đã ở trạng thái kết thúc, chỉ cho hiện đúng trạng thái đó
    if (["delivered", "cancelled", "fake"].includes(currentStatusKey)) {
      return STATUS.filter((s) => s.key === currentStatusKey);
    }
    // Đang shipping, cho phép chuyển sang 3 trạng thái
    if (currentStatusKey === "shipping") {
      return STATUS.filter((s) =>
        ["shipping", "delivered", "cancelled", "fake"].includes(s.key)
      );
    }
    // Các trạng thái khác: chỉ được chuyển tới trạng thái tiếp theo
    const currentStatusIndex = STATUS.findIndex((s) => s.key === currentStatusKey);
    const next = STATUS[currentStatusIndex + 1];
    return next
      ? STATUS.filter((s) => s.key === currentStatusKey || s.key === next.key)
      : STATUS.filter((s) => s.key === currentStatusKey);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await updateOrderStatus(orderId, status);
      setOrders((prevOrders) =>
        prevOrders.map((o) =>
          o._id === orderId || o.id === orderId ? { ...o, status } : o
        )
      );
      toast.success("Cập nhật trạng thái đơn hàng thành công.");
      onClose();
    } catch {
      toast.error("Cập nhật trạng thái thất bại.");
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
  // --- FIX: ship null vẫn hiển thị 0 đ ---
  const rawShippingFee =
    order.shipping ?? order.paymentId?.order_info?.shippingFee ?? null;
  const shippingFee = Number.isFinite(Number(rawShippingFee))
    ? Number(rawShippingFee)
    : 0;

  // (Tùy chọn) Tổng tiền cũng ép số để tránh rỗng khi là 0
  const totalPrice = Number.isFinite(Number(order.totalPrice))
    ? Number(order.totalPrice)
    : 0;

  const paymentMethod = order.paymentMethod ?? order.paymentId?.method ?? "";
  const availableStatus = getAvailableStatus(order.status);
  const isShipping = order.status === "shipping";
  const optionsToShow = availableStatus.filter((s) => isShipping || s.key !== "fake");

  return (
    <div
      className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center px-4 py-8"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-xl shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-h-[90vh] overflow-y-auto p-6 scroll-hidden">
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
                <label className="block text-sm font-medium mb-1">Mã đơn hàng</label>
                <input
                  className="w-full bg-gray-100 px-4 py-2 outline-none rounded-l-xl"
                  value={order.orderCode}
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ngày đặt hàng</label>
                <input
                  className="w-full bg-gray-100 px-4 py-2 outline-none rounded-r-xl"
                  value={formatDate(order.createdAt)}
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tên người mua</label>
                <input
                  className="w-full bg-gray-100 px-4 py-2 outline-none rounded-l-xl"
                  value={user.name || ""}
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Số điện thoại người mua</label>
                <input
                  className="w-full bg-gray-100 px-4 py-2 outline-none rounded-r-xl"
                  value={order.shippingAddress?.phone || ""}
                  disabled
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Email người mua</label>
              <input
                className="w-full bg-gray-100 rounded-xl px-4 py-2 outline-none"
                value={user.email || ""}
                disabled
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Địa chỉ</label>
              <textarea
                className="w-full bg-gray-100 rounded-xl px-4 py-2 outline-none"
                rows={2}
                value={formatAddress(order.shippingAddress)}
                disabled
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tổng tiền</label>
                <input
                  className="w-full bg-gray-100 px-4 py-2 outline-none rounded-l-xl"
                  value={`${totalPrice.toLocaleString()} đ`}
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tiền ship</label>
                <input
                  className="w-full bg-gray-100 px-4 py-2 outline-none rounded-r-xl"
                  value={`${shippingFee.toLocaleString()} đ`}
                  disabled
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Thanh toán qua</label>
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
                {optionsToShow.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-2 font-medium">Sản phẩm</div>
            <div className="rounded-xl bg-gray-50 mb-4">
              <div className="grid grid-cols-7 gap-2 text-gray-500 text-sm py-2 px-4 border-b border-gray-100">
                <div className="col-span-4">Tên sản phẩm</div>
                <div>Màu</div>
                <div>Size</div>
                <div>SL</div>
              </div>
              {(order.items || []).map((prod: any, idx: number) => (
                <div
                  key={idx}
                  className="grid grid-cols-7 gap-2 py-2 px-4 items-center border-b border-gray-100"
                >
                  <div className="col-span-4 font-medium flex items-center gap-2">
                    {prod.image && (
                      <Image
                        src={prod.image}
                        alt={prod.name}
                        width={40}
                        height={40}
                        className="rounded object-cover"
                      />
                    )}
                    <span className="whitespace-pre-line">{prod.name}</span>
                  </div>
                  <div>{prod.color}</div>
                  <div>{prod.size}</div>
                  <div>{prod.quantity}</div>
                </div>
              ))}
            </div>

            <button
              type="submit"
              className="w-full bg-black hover:bg-gray-900 text-white rounded-xl py-3 mt-4 font-semibold transition disabled:opacity-70"
              disabled={updating}
            >
              {updating ? "Đang lưu..." : "Cập nhật đơn hàng"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
