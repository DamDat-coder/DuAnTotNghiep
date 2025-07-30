import { ICategoryNews } from "./category";
import { ProductReview } from "./product";

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
  usageLimit: number;
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
