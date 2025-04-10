// app/admin/order/[id]/page.tsx
import AdminLayout from "@/admin/layouts/AdminLayout";
import OrderDetailForm from "@/admin/components/Admin_Order/OrderDetailForm";

interface OrderDetail {
  id: string;
  orderCode: string;
  purchaseDate: string;
  customerEmail: string;
  products: string[];
  total: number;
  status: "Đã huỷ" | "Chưa giải quyết" | "Hoàn thành";
}

// Dữ liệu giả lập cho đơn hàng
const getOrderDetail = (id: string): OrderDetail => {
  return {
    id,
    orderCode: `DH${id.padStart(4, "0")}`,
    purchaseDate: "2025-03-25 14:30:00",
    customerEmail: `customer${id}@example.com`,
    products: ["Áo thun nam", "Quần jeans"],
    total: 1500000,
    status: "Đã huỷ",
  };
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // Lấy id từ params
  const order = getOrderDetail(id); // Lấy dữ liệu đơn hàng

  return (
    <AdminLayout pageTitle={`Đơn hàng #${id}`} pageSubtitle="Chi tiết đơn hàng">
      <OrderDetailForm order={order} />
    </AdminLayout>
  );
}