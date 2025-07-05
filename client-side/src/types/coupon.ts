import { ICategoryNews } from "./category";

// types/coupon.ts
export interface Coupon {
  _id: string;
  code: string;
  description: string;
  discountType: string;
  discountValue: number;
  minOrderAmount: number | null;
  maxDiscountAmount: number | null;
  startDate: string;
  endDate: string;
  usageLimit: number | null;
  usedCount: number;
  is_active: boolean;
  applicableCategories: ICategoryNews[]; 
  applicableProducts: string[]; 
  createdAt: string;
  updatedAt: string;
}
