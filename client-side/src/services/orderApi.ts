import { API_BASE_URL, fetchWithAuth } from "./api";

// Tạo đơn hàng
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

// Lấy tất cả đơn hàng (cho admin)
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

    const url = `${API_BASE_URL}/order`;
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

// Lấy chi tiết đơn hàng theo ID
export async function fetchOrderById(id: string): Promise<any> {
  try {
    const response = await fetchWithAuth<any>(`${API_BASE_URL}/order/${id}`, {
      cache: "no-store",
    });
    return response;
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    throw error;
  }
}

// Cập nhật trạng thái đơn hàng
export async function updateOrderStatus(
  orderId: string,
  status: string
): Promise<void> {
  try {
    console.log(`Updating order ${orderId} with status ${status}`);
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