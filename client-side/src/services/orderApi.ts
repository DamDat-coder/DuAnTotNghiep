import { PaymentInfo } from "@/types/payment";
import { API_BASE_URL, fetchWithAuth } from "./api";
import { IOrder } from "@/types/order";
// Initiate payment
// Khởi tạo thanh toán
export async function initiatePayment(
  paymentInfo: PaymentInfo
): Promise<{ paymentId: string; paymentUrl?: string }> {
  try {
    // Chọn endpoint tương ứng theo payment method
    let endpoint = "";

    switch (paymentInfo.orderInfo.paymentMethod) {
      case "cod":
        endpoint = "/payment/cod";
        break;
      case "vnpay":
        endpoint = "/payment/create-vnpay-payment";
        break;
      case "momo":
        endpoint = "/payment/create-momo-payment";
        break;
      case "zalopay":
        endpoint = "/payment/create-payment-zalopay";
        break;
      default:
        throw new Error("Phương thức thanh toán không hợp lệ");
    }

    console.log("Payment info sent to BE:", paymentInfo);

    const res = await fetchWithAuth<any>(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(paymentInfo),
    });

    return res;
  } catch (error: any) {
    console.error("Error initiating payment:", error);
    throw new Error(error.message || "Không thể khởi tạo thanh toán");
  }
}

// Tạo đơn hàng chính thức
export async function createOrder(
  paymentId: string,
  userId: string
): Promise<{ orderId: string }> {
  try {
    const res = await fetchWithAuth<{ orderId: string }>(
      `${API_BASE_URL}/orders`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, userId }),
      }
    );
    return res;
  } catch (error: any) {
    console.error("Error creating order:", error);
    throw new Error(error.message || "Không thể tạo đơn hàng");
  }
}
// 3. Lấy tất cả đơn hàng (cho admin) với phân trang, lọc trạng thái
export async function fetchAllOrders(
  query: {
    page?: number;
    limit?: number;
    status?: string;
  } = {}
): Promise<{ data: any[]; total: number; page: number; limit: number }> {
  try {
    const queryParams = new URLSearchParams();
    if (query.page) queryParams.append("page", query.page.toString());
    if (query.limit) queryParams.append("limit", query.limit.toString());
    if (query.status) queryParams.append("status", query.status);

    const url =
      queryParams.toString().length > 0
        ? `${API_BASE_URL}/orders?${queryParams.toString()}`
        : `${API_BASE_URL}/orders`;

    const response = await fetchWithAuth<{
      data: any[];
      total: number;
      page: number;
      limit: number;
    }>(url, {
      cache: "no-store",
    });
    return response;
  } catch (error) {
    console.error("Error fetching all orders:", error);
    throw error;
  }
}

// 4. Lấy chi tiết đơn hàng theo ID (cho cả user lẫn admin)
export async function fetchOrderById(id: string): Promise<any> {
  try {
    const response = await fetchWithAuth<any>(`${API_BASE_URL}/orders/${id}`, {
      cache: "no-store",
    });
    return response;
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    throw error;
  }
}

// 5. Cập nhật trạng thái đơn hàng (admin)
export async function updateOrderStatus(
  orderId: string,
  status: string
): Promise<void> {
  try {
    await fetchWithAuth(`${API_BASE_URL}/orders/${orderId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
}

// 6. Lấy danh sách đơn hàng của user đang đăng nhập
export async function fetchMyOrders(userId: string): Promise<{ data: any[] }> {
  try {
    const response = await fetchWithAuth<{ data: any[] }>(
      `${API_BASE_URL}/orders/user/${userId}`,
      { cache: "no-store" }
    );
    return response;
  } catch (error) {
    console.error("Error fetching my orders:", error);
    throw error;
  }
}

// 7. Hủy đơn hàng (người dùng)
export async function cancelOrder(orderId: string): Promise<void> {
  try {
    await fetchWithAuth(`${API_BASE_URL}/orders/${orderId}/cancel`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error canceling order:", error);
    throw error;
  }
}

// 6. Lấy danh sách đơn hàng của user đang đăng nhập
export async function fetchOrdersUser(
  userId: string
): Promise<{ data: any[] }> {
  try {
    const response = await fetchWithAuth<{ data: any[] }>(
      `${API_BASE_URL}/orders/user/${userId}`,
      { cache: "no-store" }
    );
    return response;
  } catch (error) {
    console.error("Error fetching my orders:", error);
    throw error;
  }
}

// Lấy 5 sản phẩm bán chạy nhất
export function getBestSellingProductsFromOrders(
  orders: IOrder[],
  time: "week" | "month" = "week",
  limit = 5
) {
  const now = new Date();

  const filteredOrders = orders.filter(order => {
    if (!order.createdAt) return false;
    const createdAt = new Date(order.createdAt);
    const diffDays = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    return time === "week" ? diffDays <= 7 : diffDays <= 30;
  });

  const productMap = new Map<string, {
    id: string;
    name: string;
    image: string;
    color: string;
    size: string;
    price: number;
    sold: number;
  }>();

  filteredOrders.forEach(order => {
    order.items.forEach(item => {
      const key = `${item.productId}-${item.color}-${item.size}`; // nếu cần phân biệt theo biến thể

      if (!productMap.has(key)) {
        productMap.set(key, {
          id: item.productId,
          name: item.name,
          image: item.image,
          color: item.color,
          size: item.size,
          price: item.price,
          sold: item.quantity,
        });
      } else {
        const existing = productMap.get(key)!;
        existing.sold += item.quantity;
        productMap.set(key, existing);
      }
    });
  });

  const sorted = Array.from(productMap.values()).sort((a, b) => b.sold - a.sold);

  return sorted.slice(0, limit);
}
