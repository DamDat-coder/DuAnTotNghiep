import { Coupon, CouponResponse } from "@/types/coupon";
import { API_BASE_URL, fetchWithAuth } from "./api";

export async function fetchCoupons(
  page?: number,
  limit?: number,
  search?: string,
  is_active?: boolean,
  code?: string
): Promise<{
  coupons: Coupon[];
  total: number;
  totalPages: number;
  currentPage: number;
}> {
  try {
    const queryParams = new URLSearchParams({
      page: (page ?? 1).toString(),
      limit: (limit ?? 10).toString(),
      ...(search && { search }),
      ...(code && { code }),
      ...(typeof is_active !== "undefined" && {
        is_active: is_active.toString(),
      }),
    });

    const res = await fetchWithAuth<any>(
      `${API_BASE_URL}/coupons?${queryParams.toString()}`,
      {
        cache: "no-store",
      }
    );
    // console.log("API raw response:", res);
    return {
      coupons: res.coupons || res.data || [],
      total: res.total || res.pagination?.total || 0,
      totalPages: res.totalPages || res.pagination?.totalPages || 0,
      currentPage: res.currentPage || res.pagination?.page || (page ?? 1),
    };
  } catch (error: any) {
    console.error("Lỗi khi lấy danh sách mã khuyến mãi:", error);
    return { coupons: [], total: 0, totalPages: 0, currentPage: page ?? 1 };
  }
}

export async function createCoupon(coupon: Partial<Coupon>): Promise<Coupon> {
  try {
    const res = await fetchWithAuth<Coupon>(`${API_BASE_URL}/coupons`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(coupon),
    });
    return res;
  } catch (error) {
    console.error("Error creating coupon:", error);
    throw error;
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
export async function hideCoupon(id: string): Promise<void> {
  try {
    await fetchWithAuth<{ message: string }>(`${API_BASE_URL}/coupons/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: false }),
    });
  } catch (error: any) {
    console.error(`Lỗi khi ẩn coupon với ID ${id}:`, error);
    throw new Error(error.message || "Ẩn mã giảm giá thất bại");
  }
}

export async function enableCoupon(id: string): Promise<void> {
  try {
    await fetchWithAuth<{ message: string }>(`${API_BASE_URL}/coupons/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: true }),
    });
  } catch (error: any) {
    console.error(`Lỗi khi mở khóa coupon với ID ${id}:`, error);
    throw new Error(error.message || "Mở khóa mã giảm giá thất bại");
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
    const url = `${API_BASE_URL}/coupons?search=${encodeURIComponent(
      code
    )}&isActive=true&limit=1`;
    const response = await fetchWithAuth<{ data: Coupon[] }>(url, {
      cache: "no-store",
    });

    const coupon = response.data?.find(
      (c) => c.code.toLowerCase() === code.toLowerCase()
    );

    if (!coupon) {
      return { success: false, message: "Mã giảm giá không hợp lệ." };
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
export async function fetchAllCoupons(
  isActive?: boolean,
  search?: string,
  page: number = 1,
  limit: number = 10
): Promise<{
  data: Coupon[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}> {
  try {
    const queryParams = new URLSearchParams();
    if (isActive !== undefined)
      queryParams.append("isActive", String(isActive));
    if (search) queryParams.append("search", search);
    queryParams.append("page", String(page));
    queryParams.append("limit", String(limit));

    const response = await fetchWithAuth<{
      data: Coupon[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>(`${API_BASE_URL}/coupons?${queryParams.toString()}`, {
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
