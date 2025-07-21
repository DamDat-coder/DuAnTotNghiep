import { PaymentInfo } from "@/types/payment";
import { API_BASE_URL, fetchWithAuth } from "./api";
import { IOrder, OrderDetail } from "@/types/order";
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

export async function fetchOrderByIdForUser(id: string): Promise<OrderDetail> {
  try {
    const response = await fetchWithAuth<any>(`${API_BASE_URL}/orders/${id}`, {
      cache: "no-store",
    });

    console.log("fetchOrderByIdForUser response:", response);

    if (!response.success || !response.data || typeof response.data !== "object") {
      throw new Error("Invalid order data received: Response is empty or not an object");
    }

    const order = response.data;

    return {
      _id: order._id || id,
      userId: typeof order.userId === "object" ? order.userId._id || "" : order.userId || "",
      couponId: order.couponId || null,
      address_id: order.address_id || "",
      shippingAddress: order.shippingAddress || {
        street: "",
        ward: "",
        district: "",
        province: "",
        is_default: false,
      },
      totalPrice: order.totalPrice || 0,
      shipping: order.shipping || 0,
      status:
        order.status &&
        ["pending", "confirmed", "shipping", "delivered", "cancelled"].includes(order.status)
          ? order.status
          : "unknown",
      paymentMethod:
        order.paymentMethod &&
        ["cod", "vnpay", "momo", "zalopay"].includes(order.paymentMethod)
          ? order.paymentMethod
          : "unknown",
      paymentId: typeof order.paymentId === "object" ? order.paymentId._id || null : order.paymentId || null,
      items: Array.isArray(order.items)
        ? order.items.map((item: any) => ({
            productId: item.productId || "",
            name: item.name || "Unknown Product",
            image: item.image || "/fallback-image.jpg",
            color: item.color || "Chưa xác định",
            size: item.size || "Chưa xác định",
            price: item.price || 0,
            quantity: item.quantity || 0,
          }))
        : [],
      note: order.note || undefined,
      createdAt: order.createdAt ? new Date(order.createdAt) : undefined,
      updatedAt: order.updatedAt ? new Date(order.updatedAt) : undefined,
    } as OrderDetail;
  } catch (error) {
    console.error(`Error fetching order ${id}:`, error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return {
      _id: id,
      userId: "",
      couponId: null,
      address_id: "",
      shippingAddress: { street: "", ward: "", district: "", province: "", is_default: false },
      totalPrice: 0,
      shipping: 0,
      status: "pending",
      paymentMethod: "cod",
      paymentId: null,
      items: [],
      note: undefined,
      createdAt: undefined,
      updatedAt: undefined,
    } as OrderDetail;
  }
}
