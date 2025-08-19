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

// Helper: xác định đơn thanh toán qua cổng (đã chắc chắn trả tiền)
const isGatewayPaid = (pm: IOrder['paymentMethod'] | null | undefined): boolean =>
  pm === 'vnpay' || pm === 'zalopay';

// ----------- HÀM THỐNG KÊ DASHBOARD TRONG NGÀY -----------
export async function fetchStats() {
  checkClient();
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  try {
    // Users mới hôm nay
    const res = await fetchAllUsersAdmin("", 1, 9999);
    const usersRaw = res.users || [];
    const users: IUser[] = usersRaw.map((u: any) => ({
      ...u,
      addresses: u.addresses ?? [],
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));

    const usersToday = users.filter(u => {
      if (!u.createdAt) return false;
      const created = new Date(u.createdAt);
      return created >= startOfDay && created <= endOfDay;
    });

    // Đơn hàng trong ngày
    const ordersRes = await fetchAllOrders({ limit: 9999 });
    const allOrders: IOrder[] = ordersRes.data || [];
    const newOrders = allOrders.filter((o) => {
      if (!o.createdAt) return false;
      const created = new Date(o.createdAt);
      return created >= startOfDay && created <= endOfDay;
    });

    // Đơn đủ điều kiện tính doanh thu: delivered || (vnpay|zalopay)
    const eligibleOrders = newOrders.filter(
      (o) => o.status === "delivered" || isGatewayPaid(o.paymentMethod)
    );

    // Doanh thu: tổng totalPrice của eligibleOrders
    const revenue = eligibleOrders.reduce(
      (sum, o) => sum + (o.totalPrice || 0),
      0
    );

    // Sản phẩm bán ra: chỉ tính từ delivered (đồng bộ tồn kho)
    let sold = 0;
    newOrders.forEach((order) => {
      if (order.status === "delivered" && Array.isArray(order.items)) {
        sold += order.items.reduce((s, i) => s + (i.quantity || 0), 0);
      }
    });

    // Kết quả trả về:
    // - Đơn hàng: TỔNG mọi đơn trong ngày
    // - Doanh thu: theo điều kiện ở trên
    return [
      { label: "Khách hàng mới", value: usersToday.length, change: "" },
      { label: "Đơn hàng", value: newOrders.length, change: "" }, // tổng mọi đơn trong ngày
      { label: "Doanh thu", value: revenue.toLocaleString("vi-VN") + "đ", change: "" },
      { label: "Sản phẩm bán ra", value: sold.toLocaleString("vi-VN"), change: "" },
    ];
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
export async function getBestSellingProductsFromOrders(
  orders: IOrder[],
  timeRange: "today" | "week" | "month" = "today",
  top: number = 5
) {
  // Lọc đơn theo timeRange
  const now = new Date();
  let start: Date, end: Date = new Date(now);
  if (timeRange === "today") {
    start = new Date(now); start.setHours(0,0,0,0);
    end = new Date(now); end.setHours(23,59,59,999);
  } else if (timeRange === "week") {
    const day = now.getDay();
    start = new Date(now); start.setDate(now.getDate() - (day === 0 ? 6 : day - 1)); start.setHours(0,0,0,0);
    end = new Date(start); end.setDate(start.getDate() + 6); end.setHours(23,59,59,999);
  } else { // "month"
    start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  }

  // Lọc các order đã giao thành công trong khoảng thời gian này
  const filteredOrders = orders.filter(order => {
    if (!order.createdAt) return false;
    const created = new Date(order.createdAt);
    return (
      order.status === "delivered" &&
      created >= start &&
      created <= end
    );
  });

  // Gom nhóm và đếm số lượng bán của từng sản phẩm/variant
  const productMap = new Map<string, any>();
  filteredOrders.forEach(order => {
    (order.items || []).forEach(item => {
      // key unique theo productId, color, size
      const key = `${item.productId}_${item.color}_${item.size}`;
      if (!productMap.has(key)) {
        productMap.set(key, {
          id: item.productId,
          name: item.name,
          image: item.image,
          color: item.color,
          size: item.size,
          price: item.price,
          sold: 0,
        });
      }
      productMap.get(key).sold += item.quantity;
    });
  });

  // Sắp xếp và lấy top N
  const list = Array.from(productMap.values())
    .sort((a, b) => b.sold - a.sold)
    .slice(0, top);

  return list;
}

// ----------- GIAO DỊCH GẦN NHẤT -----------
export async function fetchTransactionHistory() {
  checkClient();
  const ordersRes = await fetchAllOrders({ limit: 9999 });
  const allOrders: IOrder[] = ordersRes.data || [];

  const pendingOrders = allOrders.filter(o => o.status === "pending");

  return pendingOrders
    .sort(
      (a, b) =>
        new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime()
    )
    .map((order) => ({
      id: order._id,
      date: order.createdAt,
      amount: order.totalPrice || 0,
      status: order.status,
      orderCode: order.orderCode || "",
    }));
}
