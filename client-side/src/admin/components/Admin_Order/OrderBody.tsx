import React, { useState, useRef, useEffect } from "react";
import { updateOrderStatus } from "@/services/orderApi";

// THÊM props setOrders vào đây!
export default function OrderBody({
  orders,
  setOrders,
  STATUS,
  onEdit,
  onView,
}) {
  const [actionDropdownId, setActionDropdownId] = useState(null);
  const [statusDropdownId, setStatusDropdownId] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const actionPopupRef = useRef(null);
  const statusPopupRef = useRef(null);

  useEffect(() => {
    const handler = (event) => {
      if (
        statusPopupRef.current &&
        !statusPopupRef.current.contains(event.target)
      ) {
        setStatusDropdownId(null);
      }
      if (
        actionPopupRef.current &&
        !actionPopupRef.current.contains(event.target)
      ) {
        setActionDropdownId(null);
      }
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, []);

  const getStatusInfo = (key) => STATUS.find((s) => s.key === key);

  const getAvailableStatus = (currentStatusKey) => {
    const currentStatusIndex = STATUS.findIndex((s) => s.key === currentStatusKey);
    return STATUS.filter(
      (s, idx) =>
        idx >= currentStatusIndex ||
        s.key === "cancelled"
    );
  };

  // Cập nhật trạng thái chỉ trên FE, không reload!
  const handleQuickStatusChange = async (orderId, oldStatus, newStatus) => {
    if (oldStatus === newStatus) return;
    setUpdatingStatusId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          (order._id === orderId || order.id === orderId)
            ? { ...order, status: newStatus }
            : order
        )
      );
    } catch (e) {
      alert("Lỗi khi cập nhật trạng thái");
    }
    setUpdatingStatusId(null);
    setStatusDropdownId(null);
  };

  function formatDate(dateString?: string) {
    if (!dateString) return "Không xác định";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  }

  if (!orders || orders.length === 0) {
    return (
      <tr>
        <td colSpan={6} className="text-center py-10 text-[#BDBDBD]">
          Không tìm thấy đơn hàng phù hợp
        </td>
      </tr>
    );
  }

  return (
    <>
      {orders.map((order, idx) => {
        const orderId = order._id?.$oid || order._id || order.id || String(idx);

        // Lấy tên sản phẩm từ items
        let productList = [];
        if (Array.isArray(order.items) && order.items.length > 0) {
          productList = order.items.map((item) => item.name).filter(Boolean);
        }

        const productsRender = (
          <>
            {productList.length === 0 && (
              <div className="text-gray-400 text-xs italic">Không có sản phẩm</div>
            )}
            {productList.slice(0, 2).map((name, idx2) => (
              <div key={orderId + "-prod-" + idx2} className="truncate leading-5">
                {name}
              </div>
            ))}
            {productList.length > 2 && (
              <div className="text-gray-400 text-xs">
                ...và {productList.length - 2} sản phẩm khác
              </div>
            )}
          </>
        );

        const user = order.user || order.userId || { name: "Không xác định", email: "" };
        const userInfo = (
          <>
            <div className="truncate font-medium">{user.name || "Không xác định"}</div>
            <div className="truncate text-gray-400 text-xs">{user.email || ""}</div>
          </>
        );
        const createdDate = formatDate(order.createdAt);
        const status = getStatusInfo(order.status);
        const availableStatus = getAvailableStatus(order.status);

        return (
          <tr
            key={orderId}
            className="border-b hover:bg-[#F9FAFB] transition-colors duration-150"
          >
            <td className="px-4 py-4 font-semibold text-[#202020] w-[130px] max-w-[130px] truncate">
              {orderId}
            </td>
            <td className="px-4 py-4 w-[380px] max-w-[380px]">
              {productsRender}
            </td>
            <td className="px-4 py-4 w-[200px] max-w-[200px]">{userInfo}</td>
            <td className="px-4 py-4 w-[156px] font-semibold text-[#212121] max-w-[156px] truncate">
              {createdDate}
            </td>
            <td className="px-4 py-4 w-[156px] max-w-[156px] align-middle">
              <div style={{ position: "relative", display: "inline-block", width: "100%" }}>
                <span
                  className={`
                    inline-flex items-center justify-between
                    rounded-[8px] font-normal
                    ${status?.color ?? ""}
                    min-h-[32px] px-2 py-1
                    text-xs
                    transition
                    overflow-hidden
                    hover:cursor-pointer
                  `}
                  style={{
                    background: status?.color ? undefined : "#F5F5F5",
                    color: status?.color ? undefined : "#7c7c7c",
                    opacity: updatingStatusId === orderId ? 0.7 : 1,
                    fontSize: 12,
                    width: "100%",
                    maxWidth: "100%",
                  }}
                  title={status?.label ?? order.status}
                  onClick={(e) => {
                    e.stopPropagation();
                    setStatusDropdownId(
                      statusDropdownId === orderId ? null : orderId
                    );
                  }}
                >
                  <span className="truncate block" style={{ flex: 1 }}>
                    {status?.label ?? order.status}
                  </span>
                  <svg
                    width={16}
                    height={16}
                    fill="none"
                    className="ml-2 flex-shrink-0"
                    style={{ opacity: 0.6 }}
                  >
                    <path d="M4 6l4 4 4-4" stroke="#888" strokeWidth={2} />
                  </svg>
                </span>
                {statusDropdownId === orderId && (
                  <div
                    ref={statusPopupRef}
                    className="absolute z-40 left-0 mt-2 min-w-[140px] bg-white border border-gray-200 rounded-xl shadow-lg p-2 animate-fadeIn"
                  >
                    {availableStatus.map((s) => (
                      <button
                        key={s.key}
                        disabled={updatingStatusId === orderId || s.key === order.status}
                        className={`w-full text-left px-4 py-2 rounded-lg font-medium text-xs hover:bg-gray-100 transition-colors mb-1 ${s.key === order.status ? "text-blue-600 bg-gray-50" : ""}`}
                        onClick={() =>
                          handleQuickStatusChange(orderId, order.status, s.key)
                        }
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </td>
            <td className="px-4 py-4 w-[56px] text-right max-w-[56px] relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActionDropdownId(
                    actionDropdownId === orderId
                      ? null
                      : orderId
                  );
                }}
                className="text-xl font-semibold text-gray-500 cursor-pointer p-2"
                title="Thao tác"
                style={{ minWidth: 36, minHeight: 36 }}
              >
                <span>...</span>
              </button>
              {actionDropdownId === orderId && (
                <div
                  ref={actionPopupRef}
                  className="absolute right-2 top-10 z-50 min-w-[130px] rounded-lg bg-white shadow border border-gray-100 animate-fadeIn"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-[#2998FF] rounded-lg transition-colors"
                    onClick={() => {
                      setActionDropdownId(null);
                      onEdit?.(order);
                    }}
                  >
                    Sửa đơn hàng
                  </button>
                </div>
              )}
            </td>
          </tr>
        );
      })}
    </>
  );
}
