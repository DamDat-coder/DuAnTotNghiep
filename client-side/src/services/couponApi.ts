import { Coupon } from "@/types/coupon";
import { API_BASE_URL, fetchWithAuth } from "./api";

export async function fetchCoupons(): Promise<{
  coupons: Coupon[];
}> {
  try {
    const res = await fetchWithAuth<Coupon[]>(`${API_BASE_URL}/coupons`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    // Verify that the response is an array
    if (!Array.isArray(res)) {
      throw new Error("Dữ liệu trả về không phải là danh sách mã giảm giá");
    }

    return {
      coupons: res,
    };
  } catch (error: any) {
    console.error("Lỗi khi lấy danh sách mã giảm giá:", error);
    throw new Error(`Lỗi khi lấy danh sách mã giảm giá: ${error.message}`);
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
