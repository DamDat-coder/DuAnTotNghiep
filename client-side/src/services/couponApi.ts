import { Coupon, CouponResponse } from "@/types/coupon";
import { API_BASE_URL, fetchWithAuth } from "./api";

export async function fetchCoupons(params: {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}): Promise<CouponResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.search) queryParams.append("search", params.search);
    if (params.isActive !== undefined)
      queryParams.append("isActive", params.isActive.toString());

    const url = `${API_BASE_URL}/coupons?${queryParams.toString()}`;
    console.log("Fetching coupons from URL:", url); // Debug URL

    const res = await fetchWithAuth<CouponResponse>(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    console.log("API Response:", res); // Debug API response

    // Handle array response
    if (Array.isArray(res)) {
      return {
        data: res,
        pagination: {
          total: res.length,
          page: params.page || 1,
          limit: params.limit || 10,
          totalPages: Math.ceil(res.length / (params.limit || 10)),
        },
      };
    }

    // Handle object response
    if (!res.data || !Array.isArray(res.data) || !res.pagination) {
      console.error("Invalid response structure:", res);
      throw new Error("Dữ liệu trả về không đúng định dạng");
    }

    return res;
  } catch (error: any) {
    console.error("Lỗi khi lấy danh sách mã giảm giá:", {
      message: error.message,
      stack: error.stack,
      params,
    });
    throw new Error(
      `Lỗi khi lấy danh sách mã giảm giá: ${error.message || "Unknown error"}`
    );
  }
}
export async function createCoupon(coupon: Partial<Coupon>): Promise<Coupon> {
  try {
    const res = await fetchWithAuth<Coupon>(`${API_BASE_URL}/coupons`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(coupon),
    });

    console.log("Mã giảm giá đã được tạo thành công:", res);
    return res;
  } catch (error) {
    console.error("Lỗi khi tạo mã giảm giá:", error);
    throw error;
  }
}

// ✅ Cập nhật trạng thái ẩn/hiện mã giảm giá
export async function updateCouponStatus(
  id: string,
  active: boolean
): Promise<void> {
  try {
    await fetchWithAuth<{ message: string }>(
      `${API_BASE_URL}/coupons/${id}/status`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active }),
      }
    );
  } catch (error: any) {
    console.error("Lỗi khi cập nhật trạng thái mã giảm giá:", error);
    throw new Error(error.message || "Cập nhật trạng thái thất bại");
  }
}

// ✅ Cập nhật thông tin mã giảm giá
export async function updateCoupon(
  id: string,
  coupon: Partial<Coupon>
): Promise<Coupon> {
  try {
    const res = await fetchWithAuth<Coupon>(`${API_BASE_URL}/coupons/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(coupon),
    });

    return res;
  } catch (error: any) {
    console.error(`Lỗi khi cập nhật coupon với ID ${id}:`, error);
    throw new Error(error.message || "Cập nhật mã giảm giá thất bại");
  }
}

// ✅ Xoá mã giảm giá
export async function deleteCoupon(id: string): Promise<void> {
  try {
    await fetchWithAuth<{ message: string }>(`${API_BASE_URL}/coupons/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error(`Lỗi khi xoá coupon với ID ${id}:`, error);
    throw new Error(error.message || "Xoá mã giảm giá thất bại");
  }
}

// Kiểm tra mã giảm giá
export async function validateCoupon(
  code: string,
  orderTotal: number
): Promise<{
  success: boolean;
  message?: string;
  data?: { id: string; discountValue: number; discountType: string };
}> {
  try {
    const response = await fetchWithAuth<Coupon[]>(`${API_BASE_URL}/coupons`, {
      cache: "no-store",
    });

    const coupon = response.find((c) => c.code === code);
    if (!coupon) {
      return { success: false, message: "Mã giảm giá không hợp lệ." };
    }

    // Kiểm tra điều kiện áp dụng mã giảm giá
    if (!coupon.is_active) {
      return { success: false, message: "Mã giảm giá không còn hoạt động." };
    }

    const now = new Date();
    if (new Date(coupon.startDate) > now || new Date(coupon.endDate) < now) {
      return { success: false, message: "Mã giảm giá hết hiệu lực." };
    }

    if (
      coupon.usageLimit &&
      coupon.usedCount &&
      coupon.usedCount >= coupon.usageLimit
    ) {
      return { success: false, message: "Mã giảm giá đã hết lượt sử dụng." };
    }

    if (coupon.minOrderAmount && orderTotal < coupon.minOrderAmount) {
      return {
        success: false,
        message: `Đơn hàng cần tối thiểu ${coupon.minOrderAmount}đ để áp dụng mã.`,
      };
    }

    return {
      success: true,
      data: {
        id: coupon._id,
        discountValue: coupon.discountValue,
        discountType: coupon.discountType,
      },
    };
  } catch (error: any) {
    console.error("Error validating coupon:", error);
    return {
      success: false,
      message: error.message || "Không thể kiểm tra mã giảm giá",
    };
  }
}

// Lấy tất cả mã giảm giá
export async function fetchAllCoupons(): Promise<Coupon[]> {
  try {
    const response = await fetchWithAuth<Coupon[]>(`${API_BASE_URL}/coupons`, {
      cache: "no-store",
    });
    return response;
  } catch (error) {
    console.error("Error fetching coupons:", error);
    throw error;
  }
}

// Lấy mã giảm giá theo ID
export async function fetchCouponById(id: string): Promise<Coupon> {
  try {
    const response = await fetchWithAuth<Coupon>(
      `${API_BASE_URL}/coupons/${id}`,
      {
        cache: "no-store",
      }
    );
    return response;
  } catch (error) {
    console.error("Error fetching coupon by ID:", error);
    throw error;
  }
}
