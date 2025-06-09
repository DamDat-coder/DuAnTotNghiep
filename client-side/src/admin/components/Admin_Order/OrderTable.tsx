"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminNavigation from "../AdminNavigation";
import { Order } from "@/types/order";

interface SortConfig {
  key: "total" | "products";
  direction: "asc" | "desc";
}

interface OrderTableProps {
  initialOrders: Order[];
  navigationItems: { label: string; href: string; filter?: string }[];
}

const statusText: { [key: string]: string } = {
  pending: "Chưa giải quyết",
  success: "Hoàn thành",
  cancelled: "Đã huỷ",
};

export default function OrderTable({ initialOrders, navigationItems }: OrderTableProps) {
  const router = useRouter();
  const [orders] = useState<Order[]>(initialOrders);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>(initialOrders);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("Tất cả");

  // Hàm lọc dữ liệu dựa trên filterStatus
  const handleFilter = (status: string) => {
    setFilterStatus(status);
    if (status === "Tất cả") {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter((order) => order.status === status);
      setFilteredOrders(filtered);
    }
  };

  // Hàm sắp xếp
  const handleSort = (key: "total" | "products") => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    const sortedOrders = [...filteredOrders].sort((a, b) => {
      if (key === "total") {
        return direction === "asc" ? (a.total || 0) - (b.total || 0) : (b.total || 0) - (a.total || 0);
      }
      if (key === "products") {
        const aProducts = a.products.map((p) => p.productId.name || "").join(", ");
        const bProducts = b.products.map((p) => p.productId.name || "").join(", ");
        return direction === "asc"
          ? aProducts.localeCompare(bProducts)
          : bProducts.localeCompare(aProducts);
      }
      return 0;
    });

    setFilteredOrders(sortedOrders);
    setSortConfig({ key, direction });
  };

  // Hàm xem chi tiết
  const handleViewDetails = (orderId: string) => {
    router.push(`/admin/order/${orderId}`);
  };

  // Hàm xác định màu nền cho trạng thái
  const getStatusBackground = (status: string) => {
    switch (status) {
      case "cancelled":
        return "w-full text-[#92929D] bg-[#92929D]/10";
      case "pending":
        return "w-full text-[#B70D52] bg-[#B70D52]/10";
      case "success":
        return "w-full text-[#449E3C] bg-[#56BA6C]/10";
      default:
        return "w-full text-[#B70D52] bg-[#B70D52]/10";
    }
  };

  return (
    <>
      {/* Container 1: AdminNavigation */}
      <AdminNavigation
        items={navigationItems}
        addButton={{ label: "", href: "" }}
        currentFilter={filterStatus}
        onFilter={handleFilter}
      />

      {/* Container 2: Bảng đơn hàng */}
      <div className="flex-1 rounded-[2.125rem] px-12 py-8 bg-white overflow-x-auto overflow-y-auto">
        <table className="w-full">
          <thead className="sticky -top-10 bg-white shadow-sm z-10 border-b border-gray-200">
            <tr className="text-center">
              <th className="py-4 px-6 text-base font-medium">Người dùng</th>
              <th className="py-4 px-6 text-base font-medium">
                <button onClick={() => handleSort("total")} className="flex items-center gap-2 mx-auto">
                  Tổng cộng
                  <span>{sortConfig?.key === "total" && sortConfig.direction === "desc" ? "↓" : "↑"}</span>
                </button>
              </th>
              <th className="py-4 px-6 text-base font-medium">
                <button onClick={() => handleSort("products")} className="flex items-center gap-2 mx-auto">
                  Tên sản phẩm
                  <span>{sortConfig?.key === "products" && sortConfig.direction === "desc" ? "↓" : "↑"}</span>
                </button>
              </th>
              <th className="py-4 px-6 text-base font-medium">Trạng thái</th>
              <th className="py-4 px-6 text-base font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-4 px-6 text-center text-gray-500">
                  Không có đơn hàng nào.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 text-center">
                  <td className="py-4 px-6 text-base font-medium">{order.user?.name || "Không xác định"}</td>
                  <td className="py-4 px-6 text-base font-bold">
                    {(order.total || 0).toLocaleString()} VNĐ
                  </td>
                  <td className="py-4 px-6 text-base">
                    <ul className="list-none m-0 p-0">
                      {order.products.map((p, index) => (
                        <li key={index} className="mb-1">
                          {p.productId.name || "Không xác định"}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="py-4 px-6">
                    <div className="w-full flex justify-center">
                      <span
                        className={`px-4 py-2 font-medium rounded-full ${getStatusBackground(order.status)}`}
                      >
                        {statusText[order.status] || order.status}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="w-full flex gap-4 justify-center items-center">
                      <button
                        onClick={() => handleViewDetails(order.id)}
                        className="px-4 py-2 bg-white text-black border border-black rounded-full hover:bg-gray-100"
                      >
                        Xem chi tiết
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}