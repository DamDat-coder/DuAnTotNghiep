import { fetchProducts } from "./productApi";
import { fetchAllOrders } from "./orderApi";
import { fetchAllUsersAdmin } from "./userApi";
import { IOrder } from "@/types/order";

/**
 * Hàm trả về số liệu thống kê cho Dashboard
 */
export async function fetchStats() {
  const now = new Date();
  const day = now.getDay(); // CN = 0, T2 = 1, ..., T7 = 6

  // Lấy thứ 2 đầu tuần
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  startOfWeek.setHours(0, 0, 0, 0);

  // Chủ nhật cuối tuần
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  try {
    const ordersRes = await fetchAllOrders({ limit: 9999 });
    const allOrders: IOrder[] = ordersRes.data || [];

    const newOrders = allOrders.filter((o) => {
      if (!o.createdAt) return false;
      const created = new Date(o.createdAt);
      return created >= startOfWeek && created <= endOfWeek;
    });

    const revenue = newOrders.reduce(
      (sum, o) => (o.status === "delivered" ? sum + (o.totalPrice || 0) : sum),
      0
    );

    let sold = 0;
    newOrders.forEach((order) => {
      if (order.status === "delivered" && Array.isArray(order.items)) {
        sold += order.items.reduce((s, i) => s + (i.quantity || 0), 0);
      }
    });

    return [
      {
        label: "Khách hàng mới",
        value: 0,
        change: "",
      },
      {
        label: "Đơn hàng",
        value: newOrders.length,
        change: "",
      },
      {
        label: "Doanh thu",
        value: revenue.toLocaleString("vi-VN") + "đ",
        change: "",
      },
      {
        label: "Sản phẩm bán ra",
        value: sold.toLocaleString("vi-VN"),
        change: "",
      },
    ];
  } catch (error) {
    console.error("fetchStats error:", error);
    return [];
  }
}

/**
 * Biểu đồ doanh thu theo tháng từ đơn đã giao
 */
export async function fetchRevenueChart() {
  const ordersRes = await fetchAllOrders({ limit: 9999 });
  const allOrders: IOrder[] = ordersRes.data || [];
  const deliveredOrders = allOrders.filter((o) => o.status === "delivered");

  const monthMap = new Map<string, number>();
  deliveredOrders.forEach((order) => {
    if (!order.createdAt) return;
    const date = new Date(order.createdAt);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    monthMap.set(key, (monthMap.get(key) || 0) + (order.totalPrice || 0));
  });

  return Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, revenue]) => ({
      month: month.replace("-", "/"),
      revenue,
    }));
}

/**
 * Top 5 sản phẩm bán chạy nhất
 */
export async function fetchBestSellers() {
  const res = await fetchProducts({ sort_by: "best_selling", is_active: true });
  return (res.data || [])
    .slice(0, 5)
    .map((product) => ({
      id: product.id,
      name: product.name,
      category: product.category?.name || "",
      stock: product.variants?.reduce((s, v) => s + (v.stock || 0), 0) ?? 0,
      sold: product.salesCount || 0,
      price:
        product.variants && product.variants.length > 0
          ? product.variants[0].price.toLocaleString("vi-VN") + "đ"
          : "0đ",
    }));
}

/**
 * Biểu đồ khách hàng mới theo ngày (mock dữ liệu)
 */
export async function fetchCustomerChart() {
  return [
    { day: "08/07", value: 2 },
    { day: "09/07", value: 4 },
    { day: "10/07", value: 1 },
    { day: "11/07", value: 3 },
    { day: "12/07", value: 5 },
    { day: "13/07", value: 0 },
    { day: "14/07", value: 6 },
  ];
}

/**
 * Giao dịch gần nhất
 */
export async function fetchTransactionHistory() {
  const ordersRes = await fetchAllOrders({ limit: 5 });
  const allOrders: IOrder[] = ordersRes.data || [];

  allOrders.sort(
    (a, b) =>
      new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime()
  );

  return allOrders.slice(0, 5).map((order) => ({
    id: order._id,
    date: order.createdAt,
    amount: order.totalPrice || 0,
    status: order.status,
  }));
}
