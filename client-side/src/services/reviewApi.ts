import { API_BASE_URL, fetchWithAuth } from "./api";

// Định nghĩa interface cho Review
interface Review {
  _id: string;
  userId: { _id: string; name: string };
  productId: string;
  content: string;
  rating: number;
  status: "approved" | "spam";
  images?: string[];
  createdAt: string;
}

// Lấy danh sách đánh giá của sản phẩm
export async function fetchProductReviews(
  productId: string
): Promise<Review[]> {
  try {
    const response = await fetchWithAuth<{ success: boolean; data: Review[] }>(
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
  images?: File[]
): Promise<{
  success: boolean;
  message: string;
  data?: Review;
  warning?: string;
}> {
  try {
    const formData = new FormData();
    formData.append("productId", productId);
    formData.append("content", content);
    formData.append("rating", rating.toString());
    if (images) {
      images.forEach((image) => formData.append("images", image));
    }

    const response = await fetchWithAuth<{
      success: boolean;
      message: string;
      data?: Review;
      warning?: string;
    }>(`${API_BASE_URL}/reviews`, {
      method: "POST",
      body: formData,
      headers: {
        // Không set Content-Type, để browser tự xử lý với FormData
      },
    });

    return response;
  } catch (error: any) {
    console.error("Error creating review:", error);
    // Throw lại toàn bộ object để xử lý bên ngoài
    throw error;
  }
}
