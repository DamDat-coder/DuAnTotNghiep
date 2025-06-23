import { API_BASE_URL, fetchWithAuth } from "./api";

// 1. Tạo đơn hàng
export async function createOrder(order: {
  products: { productId: string; quantity: number }[];
  shippingAddress: string;
}): Promise<{ message: string; data: any } | null> {
  try {
    const res = await fetchWithAuth<any>(`${API_BASE_URL}/order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });
    return res;
  } catch (error: any) {
    console.error("Error creating order:", error);
    throw new Error(error.message || "Không thể tạo đơn hàng");
  }
}

// 2. Lấy tất cả đơn hàng (cho admin) với phân trang, lọc trạng thái
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

// 3. Lấy chi tiết đơn hàng theo ID (cho cả user lẫn admin)
export async function fetchOrderById(id: string): Promise<any> {
  try {
    // Nếu chỉ admin mới được xem tất cả, đổi endpoint về `/order/:id`
    // Nếu user thì `/order/user/orders/:id`
    // Dưới đây là cho user, nếu cần tách admin thì viết thêm hàm nữa
    const response = await fetchWithAuth<any>(`${API_BASE_URL}/order/user/orders/${id}`, {
      cache: "no-store",
    });
    return response;
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    throw error;
  }
}

// 4. Cập nhật trạng thái đơn hàng (admin)
export async function updateOrderStatus(
  orderId: string,
  status: string
): Promise<void> {
  try {
    await fetchWithAuth(`${API_BASE_URL}/order/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
}

// 5. (Tùy chọn) Lấy danh sách đơn hàng của user đang đăng nhập
export async function fetchMyOrders(): Promise<{ data: any[] }> {
  try {
    const response = await fetchWithAuth<{ data: any[] }>(
      `${API_BASE_URL}/order/user/orders`,
      { cache: "no-store" }
    );
    return response;
  } catch (error) {
    console.error("Error fetching my orders:", error);
    throw error;
  }
}
