import { fetchProducts } from "./productApi";
import { fetchAllOrders } from "./orderApi";
import { fetchAllUsersAdmin } from "./userApi";
import { IOrder } from "@/types/order";

// ----------- INTERFACE -----------
interface IUser {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  avatar?: string | null;
  role: string;
  is_active: boolean;
  addresses: any[]; // luôn là mảng!
  createdAt?: string;
  updatedAt?: string;
}

// ----------- HÀM LẤY USERS TUẦN NÀY -----------
export async function fetchNewUsersThisWeek(): Promise<IUser[]> {
  const res = await fetchAllUsersAdmin("", 1, 9999);
  // Luôn ép addresses thành mảng, tránh lỗi type
  const users: IUser[] = (res.users || []).map(u => ({
    ...u,
    addresses: u.addresses ?? [],
  }));

  // Tính ngày bắt đầu tuần (Thứ 2)
  const now = new Date();
  const day = now.getDay();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  startOfWeek.setHours(0, 0, 0, 0);

  // Lọc user mới trong tuần
  return users.filter(u => {
    if (!u.createdAt) return false;
    const created = new Date(u.createdAt);
    return created >= startOfWeek && created <= now;
  });
}

// ----------- HÀM TÍNH THỐNG KÊ -----------
export async function fetchStats() {
  const now = new Date();
  const day = now.getDay();

  // Lấy thứ 2 đầu tuần
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  startOfWeek.setHours(0, 0, 0, 0);

  // Chủ nhật cuối tuần
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  try {
    // Lấy user mới tuần này
    const usersThisWeek = await fetchNewUsersThisWeek();

    // Đơn hàng tuần này
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
        value: usersThisWeek.length,
        change: "", // có thể tính % tăng giảm nếu cần
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

// ----------- CHART KHÁCH HÀNG MỚI (THEO NGÀY) -----------
export async function fetchCustomerChart() {
  const users = await fetchNewUsersThisWeek();

  // Lấy thứ 2 đầu tuần hiện tại
  const now = new Date();
  const day = now.getDay();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  startOfWeek.setHours(0, 0, 0, 0);

  const weekdayLabels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  // Tạo mảng 7 ngày, mỗi ngày gán label thứ và đếm số user
  const daysOfWeek = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const chartData = daysOfWeek.map((d, i) => {
    const value = users.filter((u) => {
      if (!u.createdAt) return false;
      const created = new Date(u.createdAt);
      return (
        created.getDate() === d.getDate() &&
        created.getMonth() === d.getMonth() &&
        created.getFullYear() === d.getFullYear()
      );
    }).length;
    return { label: weekdayLabels[i], value }; // label là thứ!
  });

  return chartData;
}

// ----------- DOANH THU, SẢN PHẨM BÁN CHẠY, GIAO DỊCH ... Giữ nguyên như cũ -----------

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
