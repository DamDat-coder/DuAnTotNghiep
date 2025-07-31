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
    applicableItemIds: string[];
    applicableTotal: number;
  };
}> {
  try {
    console.log("DEBUG validateCoupon - Start", {
      code,
      orderTotal,
      orderItems: orderItems.map((item) => ({
        id: item.id,
        categoryId: item.categoryId,
        price: item.price,
        discountPercent: item.discountPercent,
        quantity: item.quantity,
      })),
    });

    // Kiểm tra đầu vào
    if (!code || typeof code !== "string" || code.trim() === "") {
      console.log("DEBUG validateCoupon - Invalid code");
      return { success: false, message: "Mã giảm giá không hợp lệ." };
    }
    if (typeof orderTotal !== "number" || orderTotal <= 0) {
      console.log("DEBUG validateCoupon - Invalid orderTotal");
      return { success: false, message: "Tổng đơn hàng không hợp lệ." };
    }
    if (!orderItems || orderItems.length === 0) {
      console.log("DEBUG validateCoupon - No order items");
      return {
        success: false,
        message: "Không có sản phẩm nào trong đơn hàng.",
      };
    }
    if (
      orderItems.some(
        (item) => !item.categoryId || item.categoryId.trim() === ""
      )
    ) {
      console.log(
        "DEBUG validateCoupon - Missing or invalid categoryId in orderItems"
      );
      return {
        success: false,
        message: "Thiếu thông tin danh mục cho một số sản phẩm.",
      };
    }

    const url = `${API_BASE_URL}/coupons?search=${encodeURIComponent(
      code
    )}&isActive=true&limit=1`;
    console.log("DEBUG validateCoupon - Fetching coupon", { url });
    const response = await fetchWithAuth<{ data: Coupon[] }>(url, {
      cache: "no-store",
    });

    const coupon = response.data?.find((c) => c.code === code);
    console.log("DEBUG validateCoupon - Coupon found", {
      coupon: coupon
        ? {
            _id: coupon._id,
            code: coupon.code,
            applicableCategories: coupon.applicableCategories,
            applicableProducts: coupon.applicableProducts,
            discountValue: coupon.discountValue,
            discountType: coupon.discountType,
          }
        : null,
    });

    if (!coupon) {
      console.log("DEBUG validateCoupon - Coupon not found");
      return { success: false, message: "Mã giảm giá không hợp lệ." };
    }

    const now = new Date();
    console.log("DEBUG validateCoupon - Checking dates", {
      now: now.toISOString(),
      startDate: coupon.startDate,
      endDate: coupon.endDate,
    });
    if (new Date(coupon.startDate) > now || new Date(coupon.endDate) < now) {
      console.log("DEBUG validateCoupon - Coupon expired");
      return { success: false, message: "Mã giảm giá hết hiệu lực." };
    }

    console.log("DEBUG validateCoupon - Checking usage limit", {
      usageLimit: coupon.usageLimit,
      usedCount: coupon.usedCount,
    });
    if (
      coupon.usageLimit &&
      coupon.usedCount &&
      coupon.usedCount >= coupon.usageLimit
    ) {
      console.log("DEBUG validateCoupon - Coupon usage limit reached");
      return { success: false, message: "Mã giảm giá đã hết lượt sử dụng." };
    }

    console.log("DEBUG validateCoupon - Checking minOrderAmount", {
      minOrderAmount: coupon.minOrderAmount,
      orderTotal,
    });
    if (coupon.minOrderAmount && orderTotal < coupon.minOrderAmount) {
      console.log("DEBUG validateCoupon - Order total below minimum");
      return {
        success: false,
        message: `Đơn hàng cần tối thiểu ${coupon.minOrderAmount}đ để áp dụng mã.`,
      };
    }

    // Kiểm tra các sản phẩm hợp lệ
    const applicableItems = orderItems.filter((item) => {
      console.log("DEBUG validateCoupon - Checking item applicability", {
        itemId: item.id,
        itemCategoryId: item.categoryId,
        applicableCategories: coupon.applicableCategories,
        applicableProducts: coupon.applicableProducts,
      });
      // Nếu không có applicableCategories hoặc applicableProducts, áp dụng cho tất cả sản phẩm
      if (
        (!coupon.applicableCategories ||
          coupon.applicableCategories.length === 0) &&
        (!coupon.applicableProducts || coupon.applicableProducts.length === 0)
      ) {
        console.log("DEBUG validateCoupon - Item applicable (no restrictions)");
        return true;
      }
      // Kiểm tra applicableCategories
      if (
        coupon.applicableCategories &&
        coupon.applicableCategories.length > 0
      ) {
        // Xử lý trường hợp applicableCategories là mảng object hoặc mảng string
        const isCategoryMatch = coupon.applicableCategories.some((category) => {
          if (typeof category === "string") {
            return category === item.categoryId;
          } else if (
            typeof category === "object" &&
            category !== null &&
            "_id" in category &&
            typeof (category as { _id: string })._id === "string"
          ) {
            return (category as { _id: string })._id === item.categoryId;
          }
          return false;
        });
        console.log("DEBUG validateCoupon - Category check", {
          itemCategoryId: item.categoryId,
          applicableCategories: coupon.applicableCategories,
          isCategoryMatch,
        });
        return isCategoryMatch;
      }
      // Kiểm tra applicableProducts
      if (coupon.applicableProducts && coupon.applicableProducts.length > 0) {
        const isProductMatch = coupon.applicableProducts.includes(item.id);
        console.log("DEBUG validateCoupon - Product check", {
          itemId: item.id,
          applicableProducts: coupon.applicableProducts,
          isProductMatch,
        });
        return isProductMatch;
      }
      console.log("DEBUG validateCoupon - Item not applicable");
      return false;
    });
    console.log("DEBUG validateCoupon - Applicable items", {
      applicableItemIds: applicableItems.map((item) => item.id),
      applicableItemsCount: applicableItems.length,
    });

    if (applicableItems.length === 0) {
      console.log("DEBUG validateCoupon - No applicable items");
      return {
        success: false,
        message:
          "Mã giảm giá không áp dụng được cho sản phẩm nào trong đơn hàng.",
      };
    }

    // Kiểm tra giá trị giảm giá
    console.log("DEBUG validateCoupon - Checking discountValue", {
      discountValue: coupon.discountValue,
      discountType: coupon.discountType,
    });
    if (coupon.discountValue <= 0) {
      console.log("DEBUG validateCoupon - Invalid discount value");
      return { success: false, message: "Giá trị giảm giá không hợp lệ." };
    }
    if (coupon.discountType === "percent" && coupon.discountValue > 100) {
      console.log("DEBUG validateCoupon - Invalid percent discount value");
      return {
        success: false,
        message: "Giá trị giảm giá phần trăm không hợp lệ.",
      };
    }

    // Tính tổng giá trị của các sản phẩm hợp lệ
    const applicableTotal = applicableItems.reduce(
      (sum, item) =>
        sum + item.price * (1 - item.discountPercent / 100) * item.quantity,
      0
    );
    console.log("DEBUG validateCoupon - Applicable total", { applicableTotal });

    return {
      success: true,
      data: {
        id: coupon._id,
        discountValue: coupon.discountValue,
        discountType: coupon.discountType,
        code: coupon.code,
        maxDiscountAmount: coupon.maxDiscountAmount ?? undefined,
        applicableItemIds: applicableItems.map((item) => item.id),
        applicableTotal,
      },
    };
  } catch (error: any) {
    console.error("DEBUG validateCoupon - Error", { error: error.message });
    return {
      success: false,
      message: error.message || "Không thể kiểm tra mã giảm giá.",
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

export async function fetchCouponByCode(code: string): Promise<Coupon> {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append("search", code);
    const url = `${API_BASE_URL}/coupons?${queryParams.toString()}`;
    console.log("Fetching coupon by code:", url); // Debug URL

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

    console.log("Coupon API response:", coupon);
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
