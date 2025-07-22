import { fetchProducts } from "./productApi";
import { fetchAllOrders } from "./orderApi";
import { fetchAllUsersAdmin } from "./userApi";
import { IOrder } from "@/types/order";

// ----------- INTERFACE USER THỐNG KÊ -----------
interface IUser {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  avatar?: string | null;
  role: string;
  is_active: boolean;
  addresses: any[];
  createdAt?: string;
  updatedAt?: string;
}

// ----------- HÀM CHỈ FETCH Ở CLIENT-SIDE -----------
function checkClient() {
  if (typeof window === "undefined") {
    throw new Error("Các hàm dashboardApi chỉ được gọi ở phía client!");
  }
}

// ----------- LẤY USERS MỚI TRONG TUẦN -----------
export async function fetchNewUsersThisWeek(): Promise<IUser[]> {
  checkClient();
  const res = await fetchAllUsersAdmin("", 1, 9999);

  // Đảm bảo lấy đúng mảng user từ res (BE có thể trả về users: [], hoặc data: [])
  const usersRaw = res.users || [];
  const users: IUser[] = usersRaw.map((u: any) => ({
    ...u,
    addresses: u.addresses ?? [],
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  }));

  // Xác định thứ 2 đầu tuần và cuối tuần (CN)
  const now = new Date();
  const day = now.getDay();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  // Lọc user mới trong tuần
  return users.filter(u => {
    if (!u.createdAt) return false;
    const created = new Date(u.createdAt);
    return created >= startOfWeek && created <= endOfWeek;
  });
}

// ----------- HÀM THỐNG KÊ DASHBOARD -----------
export async function fetchStats() {
  checkClient();
  const now = new Date();
  const day = now.getDay();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  try {
    // Users mới tuần này
    const usersThisWeek = await fetchNewUsersThisWeek();

    // Đơn hàng tuần này
    const ordersRes = await fetchAllOrders({ limit: 9999 });
    // Đảm bảo lấy đúng trường trả về từ BE (data hoặc orders)
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

    // Dữ liệu trả về FE
    const result = [
      {
        label: "Khách hàng mới",
        value: usersThisWeek.length,
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

    return result;
  } catch (error) {
    console.error("fetchStats error:", error);
    return [];
  }
}


// ----------- BIỂU ĐỒ KHÁCH HÀNG MỚI TRONG TUẦN -----------
export async function fetchCustomerChart() {
  checkClient();
  const users = await fetchNewUsersThisWeek();
  const now = new Date();
  const day = now.getDay();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  startOfWeek.setHours(0, 0, 0, 0);
  const weekdayLabels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  const daysOfWeek = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  return daysOfWeek.map((d, i) => {
    const value = users.filter((u) => {
      if (!u.createdAt) return false;
      const created = new Date(u.createdAt);
      return (
        created.getDate() === d.getDate() &&
        created.getMonth() === d.getMonth() &&
        created.getFullYear() === d.getFullYear()
      );
    }).length;
    return { label: weekdayLabels[i], value };
  });
}

// ----------- BIỂU ĐỒ DOANH THU THEO THÁNG -----------
export async function fetchRevenueChart() {
  checkClient();
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

// ----------- TOP 5 SẢN PHẨM BÁN CHẠY -----------
export async function fetchBestSellers() {
  checkClient();
  const res = await fetchProducts({ sort_by: "best_selling", is_active: true });
  // Đảm bảo lấy đúng trường trả về từ BE
  const products = res.data || [];
  return products
    .slice(0, 5)
    .map((product: any) => ({
      id: product.id,
      name: product.name,
      category: product.category?.name || "",
      stock: product.variants?.reduce((s: number, v: any) => s + (v.stock || 0), 0) ?? 0,
      sold: product.salesCount || 0,
      price:
        product.variants && product.variants.length > 0
          ? product.variants[0].price.toLocaleString("vi-VN") + "đ"
          : "0đ",
    }));
}

// ----------- GIAO DỊCH GẦN NHẤT -----------
export async function fetchTransactionHistory() {
  checkClient();
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
