import { Coupon, CouponResponse, SuggestCouponItem, SuggestCouponsResponse } from "@/types/coupon";
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

export async function validateCoupon(
  code: string,
  orderTotal: number,
  orderItems: {
    id: string;
    categoryId: string;
    price: number;
    discountPercent: number;
    quantity: number;
  }[]
): Promise<{
  success: boolean;
  message?: string;
  data?: {
    id: string;
    discountValue: number;
    discountType: string;
    code: string;
    maxDiscountAmount?: number;
    minOrderAmount?: number;
    applicableItemIds: string[];
    applicableTotal: number;
    discount: number;
    finalAmount: number;
    items: {
      productId: string;
      isDiscounted: boolean;
      itemDiscount: number;
      priceAfterDiscount: number;
      totalAfterDiscount: number;
    }[];
  };
}> {
  try {
    // Kiểm tra đầu vào
    if (!code || typeof code !== "string" || code.trim() === "") {
      return { success: false, message: "Mã giảm giá không hợp lệ." };
    }
    if (typeof orderTotal !== "number" || orderTotal <= 0) {
      return { success: false, message: "Tổng đơn hàng không hợp lệ." };
    }
    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return {
        success: false,
        message: "Không có sản phẩm nào trong đơn hàng.",
      };
    }
    if (
      orderItems.some(
        (item) => !item.id || !item.categoryId || item.categoryId.trim() === ""
      )
    ) {
      return {
        success: false,
        message: "Thiếu thông tin sản phẩm hoặc danh mục cho một số sản phẩm.",
      };
    }

    // Chuẩn bị dữ liệu gửi lên backend
    const payload = {
      code,
      items: orderItems.map((item) => ({
        productId: item.id,
        price: item.price, // Giá gốc
        priceAfterDiscount: Math.round(
          item.price * (1 - (item.discountPercent || 0) / 100)
        ), // Giá đã giảm
        quantity: item.quantity,
      })),
    };

    // Gọi API apply coupon của backend
    const response = await fetchWithAuth<{
      status: string;
      message?: string;
      data?: any;
    }>(`${API_BASE_URL}/coupons/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (response.status !== "success" || !response.data) {
      return {
        success: false,
        message:
          response.message ||
          "Mã giảm giá không hợp lệ hoặc không áp dụng được.",
      };
    }

    const { data } = response;

    return {
      success: true,
      data: {
        id: data.couponCode,
        discountValue: data.discountValue || data.discount,
        discountType: data.discountType || "fixed",
        code: data.couponCode,
        maxDiscountAmount: data.maxDiscountAmount,
        minOrderAmount: data.minOrderAmount,
        applicableItemIds: data.items
          .filter((item: any) => item.isDiscounted)
          .map((item: any) => item.productId),
        applicableTotal: data.applicableAmount,
        discount: data.discount,
        finalAmount: data.finalAmount,
        items: data.items.map((item: any) => ({
          productId: item.productId,
          isDiscounted: item.isDiscounted,
          itemDiscount: item.itemDiscount,
          priceAfterDiscount: item.priceAfterDiscount,
          totalAfterDiscount: item.totalAfterDiscount,
        })),
      },
    };
  } catch (error: any) {
    console.error("DEBUG validateCoupon - Error:", { error: error.message });
    return {
      success: false,
      message: error.message || "Lỗi hệ thống khi kiểm tra mã giảm giá.",
    };
  }
}

// Lấy tất cả mã giảm giá
export async function fetchAllCoupons(
  isActive?: boolean,
  search?: string,
  page: number = 1,
): Promise<{
  data: Coupon[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
  };
}> {
  try {
    const queryParams = new URLSearchParams();
    if (isActive !== undefined)
      queryParams.append("isActive", String(isActive));
    if (search) queryParams.append("search", search);
    queryParams.append("page", String(page));

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

export async function fetchCouponByCode(code: string): Promise<Coupon> {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append("search", code);
    const url = `${API_BASE_URL}/coupons?${queryParams.toString()}`;
    const res = await fetchWithAuth<{ data: Coupon[] }>(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.data || !Array.isArray(res.data)) {
      console.error("Invalid response structure:", res);
      throw new Error("Dữ liệu trả về không đúng định dạng.");
    }

    const coupon = res.data.find(
      (c) => c.code.toLowerCase() === code.toLowerCase()
    );
    if (!coupon) {
      throw new Error("Không tìm thấy mã giảm giá.");
    }

    return coupon;
  } catch (error: any) {
    console.error("Lỗi khi tìm mã giảm giá theo code:", {
      message: error.message,
      stack: error.stack,
      code,
    });
    throw new Error(
      `Lỗi khi tìm mã giảm giá: ${error.message || "Unknown error"}`
    );
  }
}

export async function fetchTopDiscountCoupons(): Promise<Coupon[]> {
  try {
    const response = await fetchWithAuth<{ data: Coupon[]; message: string }>(
      `${API_BASE_URL}/coupons/top-discounts`,
      {
        cache: "no-store",
      }
    );

    return response.data || [];
  } catch (error: any) {
    console.error("Lỗi khi lấy 3 mã giảm giá có giá trị cao nhất:", error);
    return [];
  }
}

export async function suggestCoupons(
  items: SuggestCouponItem[]
): Promise<SuggestCouponsResponse> {
  try {
    // Kiểm tra đầu vào
    if (!items || !Array.isArray(items) || items.length === 0) {
      return {
        success: false,
        message: "Danh sách sản phẩm không hợp lệ.",
      };
    }

    if (items.some((item) => !item.productId || item.price <= 0 || item.quantity <= 0)) {
      return {
        success: false,
        message: "Thông tin sản phẩm không hợp lệ.",
      };
    }

    // Chuẩn bị payload
    const payload = {
      items: items.map((item) => ({
        productId: item.productId,
        price: item.price,
        quantity: item.quantity,
      })),
    };

    // Gọi API /coupons/suggest
    const response = await fetchWithAuth<SuggestCouponsResponse>(
      `${API_BASE_URL}/coupons/suggest`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
      }
    );
    console.log(response);
    
    // Kiểm tra phản hồi từ API
    if (!response.success) {
      return {
        success: false,
        message: response.message || "Không thể gợi ý mã giảm giá.",
      };
    }

    return {
      success: true,
      totalAmount: response.totalAmount || 0,
      coupons: response.coupons || [],
    };
  } catch (error: any) {
    console.error("Lỗi khi gợi ý mã giảm giá:", error);
    return {
      success: false,
      message: error.message || "Lỗi hệ thống khi gợi ý mã giảm giá.",
    };
  }
}