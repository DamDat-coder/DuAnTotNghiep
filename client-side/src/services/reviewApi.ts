import { IReview } from "@/types/review";
import { API_BASE_URL, fetchWithAuth } from "./api";

// Lấy danh sách đánh giá của sản phẩm
export async function fetchProductReviews(
  productId: string
): Promise<IReview[]> {
  try {
    const response = await fetchWithAuth<{ success: boolean; data: IReview[] }>(
      `${API_BASE_URL}/reviews/product/${productId}`,
      {
        cache: "no-store",
      }
    );
    if (!response.success) {
      throw new Error("Không thể lấy danh sách đánh giá.");
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    throw error;
  }
}

// Tạo đánh giá mới
export async function createReview(
  productId: string,
  content: string,
  rating: number,
  orderId?: string,
  images?: File[]
): Promise<{
  success: boolean;
  message: string;
  data?: IReview;
  warning?: string;
  accountBlocked?: boolean;
}> {
  try {
    const formData = new FormData();
    formData.append("productId", productId);
    formData.append("content", content);
    formData.append("orderId", orderId ?? "");
    formData.append("rating", rating.toString());
    if (images) {
      images.forEach((image) => formData.append("images", image));
    }

    const response = await fetchWithAuth<{
      success: boolean;
      message: string;
      data?: IReview;
      warning?: string;
      accountBlocked?: boolean;
    }>(`${API_BASE_URL}/reviews`, {
      method: "POST",
      body: formData,
      headers: {},
    });

    return response;
  } catch (error: any) {
    console.error("Error creating review:", error);
    throw {
      message: error.message || "Không thể gửi đánh giá.",
      status: error.status || 500,
      accountBlocked: error.accountBlocked || false,
    };
  }
}

// Lấy tất cả đánh giá (admin)
export async function fetchAllReviews(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: "approved" | "spam";
}): Promise<{
  success: boolean;
  data: IReview[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}> {
  const query = new URLSearchParams();
  if (params?.page) query.append("page", params.page.toString());
  if (params?.limit) query.append("limit", params.limit.toString());
  if (params?.search) query.append("search", params.search);
  if (params?.status) query.append("status", params.status);

  const url = `${API_BASE_URL}/reviews?${query.toString()}`;
  return fetchWithAuth(url, { cache: "no-store" });
}

// Cập nhật trạng thái đánh giá (admin)
export async function updateReviewStatus(
  id: string,
  status: "approved" | "spam"
): Promise<{
  success: boolean;
  message: string;
  data?: IReview;
}> {
  return fetchWithAuth(`${API_BASE_URL}/reviews/${id}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
}

export async function fetchProductOrderReviews(
  productId: string,
  userId: string
): Promise<IReview[]> {
  const url = `${API_BASE_URL}/reviews/product/${productId}?userId=${userId}`;
  try {
    const response = await fetchWithAuth<{ success: boolean; data: IReview[] }>(
      url,
      { cache: "no-store" }
    );
    if (!response.success) {
      throw new Error("Không thể lấy danh sách đánh giá.");
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching product reviews with user:", error);
    throw error;
  }
}
// Trả lời đánh giá (admin)
export async function replyToReview(
  reviewId: string,
  content: string
): Promise<{
  success: boolean;
  message: string;
  data?: IReview;
}> {
  try {
    const response = await fetchWithAuth<{
      success: boolean;
      message: string;
      data?: IReview;
    }>(`${API_BASE_URL}/reviews/${reviewId}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    return response;
  } catch (error: any) {
    console.error("Error replying to review:", error);
    throw {
      message: error.message || "Không thể gửi câu trả lời.",
      status: error.status || 500,
    };
  }
}
