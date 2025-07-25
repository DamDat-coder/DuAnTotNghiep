import { API_BASE_URL, fetchWithAuth } from "./api";
import { isBrowser } from "../utils";
import { News, NewsPayload } from "@/types/new";

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

// ✅ Hàm lấy tất cả tin tức (không phân trang, không token)
export const getAllNews = async (): Promise<ApiResponse<News[]>> => {
  try {
    const res = await fetch(`${API_BASE_URL}/news/all`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const result = await res.json();

    if (!result.data || !Array.isArray(result.data)) {
      throw new Error(result.message || "Không thể lấy danh sách tin tức");
    }

    return result;
  } catch (error: any) {
    throw new Error(`Lỗi khi lấy danh sách tất cả tin tức: ${error.message}`);
  }
};

// Hàm lấy danh sách tin tức (có phân trang, tìm kiếm...)
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
      ...(isPublished !== undefined ? { isPublished: isPublished.toString() } : {}),
      ...(search ? { search } : {}),
    });

    const url = `${API_BASE_URL}/news?${params}`;
    console.log("URL gọi API:", url);

    const result = (await fetchWithAuth(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })) as ApiResponse<any>;

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

// Hàm lấy chi tiết tin tức
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

// Hàm tạo tin tức (cần token)
export const createNews = async (payload: NewsPayload): Promise<News> => {
  try {
    if (!isBrowser()) {
      throw new Error("Không thể truy cập localStorage trong môi trường không phải trình duyệt");
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
      formData.append("images", payload.thumbnail); // field name phải là "images"
    }
    if (payload.published_at) {
      formData.append("published_at", payload.published_at.toISOString());
    }
    if (payload.meta_description) {
      console.log(
        "Adding meta_description to FormData:",
        payload.meta_description
      );
      formData.append("meta_description", payload.meta_description);
    } else {
      console.warn("meta_description is empty or undefined");
      formData.append("meta_description", ""); // Gửi giá trị rỗng nếu không có meta_description
    }

    // Debug: Log FormData entries
    console.log("FormData entries:", Object.fromEntries(formData));

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

    console.log("API response:", result); // Debug: Log phản hồi từ API

    return {
      ...result.data,
      id: result.data._id || result.data.id,
    };
  } catch (error: any) {
    console.error("Debug: Error in createNews:", error);
    throw new Error(`Lỗi khi tạo tin tức: ${error.message}`);
  }
};

// Cập nhật tin tức
export const updateNews = async (
  id: string,
  payload: Partial<NewsPayload>
): Promise<News> => {
  try {
    if (!isBrowser()) {
      throw new Error("Không thể truy cập localStorage trong môi trường không phải trình duyệt");
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("Không có token. Vui lòng đăng nhập lại.");
    }

    const formData = new FormData();
    if (payload.title) formData.append("title", payload.title);
    if (payload.content) formData.append("content", payload.content);
    if (payload.slug) formData.append("slug", payload.slug);
    if (payload.category_id) {
      const categoryId = payload.category_id._id || payload.category_id;
      formData.append(
        "category_id",
        typeof categoryId === "string" ? categoryId : ""
      );
    }
    if (payload.tags) formData.append("tags", payload.tags.join(","));
    if (payload.is_published !== undefined) {
      formData.append("is_published", payload.is_published ? "true" : "false");
    }
    if (payload.thumbnail) {
      formData.append("thumbnail", payload.thumbnail); // Sử dụng "thumbnail" thay vì "images"
    }
    if (payload.meta_description && payload.meta_description.trim()) {
      console.log(
        "Adding meta_description to FormData:",
        payload.meta_description
      );
      formData.append("meta_description", payload.meta_description);
    }

    // Debug: Log FormData entries
    const formDataEntries: { [key: string]: string | File } = {};
    for (const [key, value] of formData.entries()) {
      formDataEntries[key] =
        value instanceof File ? value.name : value.toString();
    }
    console.log("FormData entries:", formDataEntries);

    const result: ApiResponse<News> = await fetchWithAuth<ApiResponse<News>>(
      `${API_BASE_URL}/news/${id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (!result.data) {
      throw new Error(
        result.message || "Không thể cập nhật tin tức, không có dữ liệu trả về"
      );
    }

    console.log("API response:", result); // Debug: Log phản hồi từ API

    return result.data;
  } catch (error: any) {
    throw new Error(`Lỗi khi cập nhật tin tức: ${error.message}`);
  }
};

// Xóa tin tức
export const deleteNews = async (id: string): Promise<void> => {
  try {
    if (!isBrowser()) {
      throw new Error("Không thể truy cập localStorage trong môi trường không phải trình duyệt");
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
