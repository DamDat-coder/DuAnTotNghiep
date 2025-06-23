export interface Sale {
  id: string; // từ _id MongoDB
  code: string;
  description: string;
  discountType: "fixed" | "percent"; // hoặc string nếu nhiều loại hơn
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number | null;
  startDate: string; // ISO string
  endDate: string;
  usageLimit?: number;
  usedCount?: number;
  status: "active" | "inactive";
}
