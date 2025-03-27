// app/admin/order/page.tsx
"use client";

import AdminLayout from "@/admin/layouts/AdminLayout";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Định nghĩa kiểu dữ liệu cho đơn hàng
interface Order {
  id: number;
  user: string;
  total: number;
  products: string[];
  status: "Đã huỷ" | "Chưa giải quyết" | "Hoàn thành";
}

// Định nghĩa kiểu dữ liệu cho cấu hình sắp xếp
interface SortConfig {
  key: "total" | "products";
  direction: "asc" | "desc";
}

// Dữ liệu mẫu
const sampleOrders: Order[] = [
  {
    id: 1,
    user: "Nguyễn Văn A",
    total: 1500000,
    products: ["Áo thun nam", "Quần jeans"],
    status: "Đã huỷ",
  },
  {
    id: 2,
    user: "Trần Thị B",
    total: 2500000,
    products: ["Giày thể thao", "Mũ lưỡi trai", "Áo khoác"],
    status: "Chưa giải quyết",
  },
  {
    id: 3,
    user: "Lê Văn C",
    total: 800000,
    products: ["Đồng hồ", "Kính râm"],
    status: "Hoàn thành",
  },
  {
    id: 4,
    user: "Phạm Thị D",
    total: 1200000,
    products: ["Túi xách"],
    status: "Chưa giải quyết",
  },
  {
    id: 5,
    user: "Phạm Thị D",
    total: 1200000,
    products: ["Túi xách"],
    status: "Chưa giải quyết",
  },
  {
    id: 6,
    user: "Phạm Thị D",
    total: 1200000,
    products: ["Túi xách"],
    status: "Chưa giải quyết",
  },
  {
    id: 7,
    user: "Phạm Thị D",
    total: 1200000,
    products: ["Túi xách"],
    status: "Chưa giải quyết",
  },
  {
    id: 8,
    user: "Phạm Thị D",
    total: 1200000,
    products: ["Túi xách"],
    status: "Chưa giải quyết",
  },
  {
    id: 9,
    user: "Phạm Thị D",
    total: 1200000,
    products: ["Túi xách"],
    status: "Chưa giải quyết",
  },
  {
    id: 10,
    user: "Phạm Thị D",
    total: 1200000,
    products: ["Túi xách"],
    status: "Chưa giải quyết",
  },
];

export default function OrderPage() {
  const router = useRouter();

  // Navigation items
  const navigationItems = [
    { label: "Đơn hàng", href: "/admin/order", filter: "Tất cả" },
    { label: "Đã huỷ", href: "/admin/order/cancelled", filter: "Đã huỷ" },
    {
      label: "Chưa giải quyết",
      href: "/admin/order/pending",
      filter: "Chưa giải quyết",
    },
    {
      label: "Hoàn thành",
      href: "/admin/order/completed",
      filter: "Hoàn thành",
    },
  ];

  // State cho dữ liệu đơn hàng, sắp xếp và lọc
  const [orders, setOrders] = useState<Order[]>(sampleOrders);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>(sampleOrders);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("Tất cả");

  // Hàm lọc dữ liệu dựa trên filterStatus
  const handleFilter = (status: string) => {
    setFilterStatus(status);
    if (status === "Tất cả") {
      setFilteredOrders(sampleOrders);
    } else {
      const filtered = sampleOrders.filter((order) => order.status === status);
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
        return direction === "asc" ? a.total - b.total : b.total - a.total;
      }
      if (key === "products") {
        const aProducts = a.products.join(", ");
        const bProducts = b.products.join(", ");
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
  const handleViewDetails = (orderId: number) => {
    router.push(`/admin/order/${orderId}`);
  };

  // Hàm xác định màu nền cho trạng thái
  const getStatusBackground = (status: string) => {
    switch (status) {
      case "Đã huỷ":
        return "w-full text-[#92929D] bg-[#92929D]/10";
      case "Chưa giải quyết":
        return "w-full text-[#B70D52] bg-[#B70D52]/10";
      case "Hoàn thành":
        return "w-full text-[#449E3C] bg-[#56BA6C]/10";
      default:
        return "w-full text-[#B70D52] bg-[#B70D52]/10";
    }
  };

  return (
    <AdminLayout
      pageTitle="Đơn hàng"
      pageSubtitle="Quản lý các đơn hàng."
      navigationItems={navigationItems}
      onFilter={handleFilter}
    >
      <div className="order-page w-full mx-auto bg-white rounded-[2.125rem] px-12 py-8 h-full flex flex-col">
        {/* Bảng đơn hàng */}
        <div className="flex-1 overflow-x-auto overflow-y-auto">
          <table className="w-full">
            <thead className="sticky -top-2 bg-white shadow-sm z-10 border-b border-gray-200">
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
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 text-center">
                  <td className="py-4 px-6 text-base font-medium">{order.user}</td>
                  <td className="py-4 px-6 text-base font-bold">{order.total.toLocaleString()} VNĐ</td>
                  <td className="py-4 px-6 text-base ">{order.products.join(", ")}</td>
                  <td className="py-4 px-6">
                    <div className="w-full flex justify-center">
                      <span
                        className={`px-4 py-2 font-medium rounded-full ${getStatusBackground(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="w-full">
                      <button
                        onClick={() => handleViewDetails(order.id)}
                        className="w-full font-medium px-4 py-2 border-2 border-black rounded-full"
                      >
                        Xem chi tiết
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}