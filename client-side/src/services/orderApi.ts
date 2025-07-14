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
        endpoint = "/payment/create-cod-payment";
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
    console.log("Order API response:", res);
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
        ? `${API_BASE_URL}/order?${queryParams.toString()}`
        : `${API_BASE_URL}/order`;

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
export async function cancelOrder(orderId: string): Promise<IOrder> {
  try {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/orders/${orderId}/cancel`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response as IOrder;
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
