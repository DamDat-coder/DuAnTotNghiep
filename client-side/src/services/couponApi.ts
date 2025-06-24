import { Sale } from "@/types/sale";
import { API_BASE_URL, fetchWithAuth } from "./api";

// Chuẩn hóa dữ liệu từ MongoDB
function mapToSale(raw: any): Sale {
  return {
    id: raw._id,
    code: raw.code,
    description: raw.description,
    discountType: raw.discountType ?? "fixed",
    discountValue: raw.discountValue ?? 0,
    minOrderAmount: raw.minOrderAmount ?? 0,
    maxDiscountAmount: raw.maxDiscountAmount ?? null,
    startDate: raw.startDate,
    endDate: raw.endDate,
    usageLimit: raw.usageLimit ?? 0,
    usedCount: raw.usedCount ?? 0,
    status:
      raw.status === "active" || raw.status === true ? "active" : "inactive",
  };
}

// ✅ Lấy danh sách coupon
export async function fetchCoupons(): Promise<Sale[]> {
  try {
    const res = await fetchWithAuth<any>(`${API_BASE_URL}/coupons`, {
      cache: "no-store",
    });
    const rawCoupons = res.data ?? res.coupons ?? [];
    return Array.isArray(rawCoupons) ? rawCoupons.map(mapToSale) : [];
  } catch (error) {
    console.error("Lỗi khi fetch coupon:", error);
    return [];
  }
}

// ✅ Thêm mã giảm giá mới
export async function createCoupon(coupon: Partial<Sale>): Promise<Sale> {
  try {
    const res = await fetchWithAuth<any>(`${API_BASE_URL}/coupons`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(coupon),
    });

    return mapToSale(res.data ?? res);
  } catch (error: any) {
    console.error("Lỗi khi tạo mã giảm giá:", error);
    throw new Error(error.message || "Thêm mã giảm giá thất bại");
  }
}

// ✅ Cập nhật trạng thái ẩn/hiện mã giảm giá
export async function updateCouponStatus(
  id: string,
  active: boolean
): Promise<void> {
  try {
    await fetchWithAuth(`${API_BASE_URL}/coupons/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
  } catch (error: any) {
    console.error("Lỗi khi cập nhật trạng thái mã giảm giá:", error);
    throw new Error(error.message || "Cập nhật trạng thái thất bại");
  }
}
