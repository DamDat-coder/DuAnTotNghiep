import { API_BASE_URL, fetchWithAuth } from "./api";

// Định nghĩa interface cho Coupon
interface Coupon {
  _id: string;
  code: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usedCount?: number;
  is_active: boolean;
}

// Kiểm tra mã giảm giá
export async function validateCoupon(code: string, orderTotal: number): Promise<{
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

    if (coupon.usageLimit && coupon.usedCount && coupon.usedCount >= coupon.usageLimit) {
      return { success: false, message: "Mã giảm giá đã hết lượt sử dụng." };
    }

    if (coupon.minOrderAmount && orderTotal < coupon.minOrderAmount) {
      return { success: false, message: `Đơn hàng cần tối thiểu ${coupon.minOrderAmount}đ để áp dụng mã.` };
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
    return { success: false, message: error.message || "Không thể kiểm tra mã giảm giá" };
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
    const response = await fetchWithAuth<Coupon>(`${API_BASE_URL}/coupons/${id}`, {
      cache: "no-store",
    });
    return response;
  } catch (error) {
    console.error("Error fetching coupon by ID:", error);
    throw error;
  }
}