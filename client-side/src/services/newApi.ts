import { API_BASE_URL, fetchWithAuth } from "./api";
import { News, NewsPayload } from "@/types/new";
import { isBrowser } from "../utils";

interface PaginationInfo {
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

interface ApiResponse<T> {
  status: "success" | "error";
  message?: string;
  data?: T;
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  pagination?: PaginationInfo;
}

// Hàm lấy danh sách tin tức (không cần token)
export const getNewsList = async (
  page: number = 1,
  limit: number = 10,
  category_id?: string,
  isPublished?: boolean,
  search?: string
) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(category_id && { category_id }),
      ...(isPublished !== undefined
        ? { isPublished: isPublished.toString() }
        : {}),
      ...(search ? { search } : {}),
    });

    // Debug: log URL
    const url = `${API_BASE_URL}/news?${params}`;
    console.log("URL gọi API:", url);

    const result = await fetchWithAuth(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }) as ApiResponse<any>;

    if (!result.data || !Array.isArray(result.data)) {
      throw new Error(result.message || "Không thể lấy danh sách tin tức");
    }

    return {
      news: result.data,
      total: result.pagination?.total || 0,
      totalPages: result.pagination?.totalPages || 1,
    };
  } catch (error: any) {
    throw new Error(`Lỗi khi lấy danh sách tin tức: ${error.message}`);
  }
};

// Hàm lấy chi tiết tin tức (không cần token)
export const getNewsDetail = async (id: string): Promise<News> => {
  try {
    const result: ApiResponse<News> = await fetchWithAuth<ApiResponse<News>>(
      `${API_BASE_URL}/news/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!result.data) {
      throw new Error(result.message || "Không thể lấy chi tiết tin tức");
    }

    return result.data;
  } catch (error: any) {
    throw new Error(`Lỗi khi lấy chi tiết tin tức: ${error.message}`);
  }
};

export const createNews = async (payload: NewsPayload): Promise<News> => {
  try {
    if (!isBrowser()) {
      throw new Error(
        "Không thể truy cập localStorage trong môi trường không phải trình duyệt"
      );
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("Không có token. Vui lòng đăng nhập lại.");
    }

    const formData = new FormData();
    formData.append("title", payload.title);
    formData.append("content", payload.content);
    formData.append("slug", payload.slug);
    formData.append("category_id", payload.category_id._id);
    if (payload.tags) {
      formData.append("tags", payload.tags.join(","));
    }
    if (payload.is_published !== undefined) {
      formData.append("is_published", payload.is_published ? "true" : "false");
    }
    if (payload.thumbnail) {
      formData.append("thumbnail", payload.thumbnail);
    }
    if (payload.news_image && payload.news_image.length > 0) {
      payload.news_image.forEach((img, index) =>
        formData.append(`news_image[${index}]`, img)
      );
    }
    if (payload.published_at) {
      formData.append("published_at", payload.published_at.toISOString());
    }

    const result: ApiResponse<News> = await fetchWithAuth<ApiResponse<News>>(
      `${API_BASE_URL}/news`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (!result.data) {
      throw new Error(result.message || "Không thể tạo tin tức");
    }

    // Ánh xạ _id thành id nếu backend trả về _id
    return {
      ...result.data,
      id: result.data._id || result.data.id, // Sử dụng _id nếu id không tồn tại
    };
  } catch (error: any) {
    throw new Error(`Lỗi khi tạo tin tức: ${error.message}`);
  }
};

// Hàm cập nhật tin tức (cần token)
export const updateNews = async (
  id: string,
  payload: Partial<NewsPayload>
): Promise<News> => {
  try {
    if (!isBrowser()) {
      throw new Error(
        "Không thể truy cập localStorage trong môi trường không phải trình duyệt"
      );
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("Không có token. Vui lòng đăng nhập lại.");
    }

    const formData = new FormData();
    if (payload.title) formData.append("title", payload.title);
    if (payload.content) formData.append("content", payload.content);
    if (payload.slug) formData.append("slug", payload.slug);
    if (payload.category_id)
      formData.append("category_id", payload.category_id._id);
    if (payload.tags) formData.append("tags", payload.tags.join(","));
    if (payload.is_published !== undefined) {
      formData.append("is_published", payload.is_published ? "true" : "false");
    }
    if (payload.thumbnail) {
      formData.append("thumbnail", payload.thumbnail); // Gửi URL
      console.log("Debug: Thumbnail URL appended", payload.thumbnail);
    }

    console.log("Debug: FormData being sent:", Object.fromEntries(formData));

    const result: ApiResponse<News> = await fetchWithAuth<ApiResponse<News>>(
      `${API_BASE_URL}/news/${id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          // Không thêm Content-Type để fetch tự xử lý multipart/form-data
        },
        body: formData,
      }
    );

    console.log("Debug: API Response:", result); // Thêm log phản hồi từ API

    if (!result.data) {
      throw new Error(result.message || "Không thể cập nhật tin tức");
    }

    return result.data;
  } catch (error: any) {
    console.error("Debug: Error updating news:", error);
    throw new Error(`Lỗi khi cập nhật tin tức: ${error.message}`);
  }
};

// Hàm xóa tin tức (cần token và quyền admin)
export const deleteNews = async (id: string): Promise<void> => {
  try {
    if (!isBrowser()) {
      throw new Error(
        "Không thể truy cập localStorage trong môi trường không phải trình duyệt"
      );
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("Không có token. Vui lòng đăng nhập lại.");
    }

    const result: ApiResponse<void> = await fetchWithAuth<ApiResponse<void>>(
      `${API_BASE_URL}/news/${id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (result.status !== "success") {
      throw new Error(result.message || "Không thể xóa tin tức");
    }
  } catch (error: any) {
    throw new Error(`Lỗi khi xóa tin tức: ${error.message}`);
  }
};
