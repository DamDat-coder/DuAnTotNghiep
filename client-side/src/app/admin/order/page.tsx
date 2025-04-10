// app/admin/order/page.tsx
"use client";

import AdminLayout from "@/admin/layouts/AdminLayout";
import OrderTable from "@/admin/components/Admin_Order/OrderTable";

// Định nghĩa kiểu dữ liệu cho đơn hàng
interface Order {
  id: number;
  user: string;
  total: number;
  products: string[];
  status: "Đã huỷ" | "Chưa giải quyết" | "Hoàn thành";
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

  return (
    <AdminLayout pageTitle="Đơn hàng" pageSubtitle="Quản lý các đơn hàng.">
      <div className="order-page w-full mx-auto h-full flex flex-col">
        <OrderTable
          initialOrders={sampleOrders}
          navigationItems={navigationItems}
        />
      </div>
    </AdminLayout>
  );
}
