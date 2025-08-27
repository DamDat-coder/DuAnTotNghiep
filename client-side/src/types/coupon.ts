// types/coupon.ts
export interface Coupon {
  _id: string;
  code: string;
  description: string;
  discountType: string;
  discountValue: number;
  minOrderAmount: number | null;
  maxDiscountAmount: number | null;
  startDate: string | null;
  endDate: string | null;
  usageLimit: number | null;
  usedCount: number;
  is_active: boolean;
  applicableCategories: string[];
  applicableProducts: string[];
  createdAt: string;
  updatedAt: string;
}
export interface CouponResponse {
  _id: string;
  code: string;
  usageLimit: number | null;
  usedCount: number;
  description: string;
  startDate: string;
  endDate: string;
  is_active: boolean;
}

export interface CouponIsUsed {
  _id: string;
  code: string;
}

export interface HighlightedCoupon {
  _id: string;
  code: string;
  description: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  discountAmount: number;
  isTop?: boolean;
  is_active: boolean;
  minOrderAmount?: number | null;
  maxDiscountAmount?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  usageLimit?: number | null;
  usedCount?: number;
  applicableCategories?: string[];
  applicableProducts?: string[];
}

export interface SuggestCouponItem {
  productId: string;
  price: number;
  quantity: number;
}

export interface SuggestedCoupon {
  code: string;
  description: string;
  discountType: string;
  discountValue: number;
  discountAmount: number;
}

export interface SuggestCouponsResponse {
  success: boolean;
  totalAmount?: number;
  coupons?: SuggestedCoupon[];
  message?: string;
}