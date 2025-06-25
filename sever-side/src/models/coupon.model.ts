import { Document, Schema, model, Types } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  description: string;
  discountType: string;
  discountValue: number;
  minOrderAmount?: number | null;
  maxDiscountAmount?: number | null;
  startDate: Date;
  endDate: Date;
  usageLimit?: number | null;
  usedCount?: number | null;
  is_active: boolean;
  applicableCategories?: Types.ObjectId[] | null;
  applicableProducts?: Types.ObjectId[] | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const couponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true },
    description: { type: String, required: true },
    discountType: { type: String, required: true },
    discountValue: { type: Number, required: true },
    minOrderAmount: { type: Number, default: null },
    maxDiscountAmount: { type: Number, default: null },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    usageLimit: { type: Number, default: null },
    usedCount: { type: Number, default: 0 },
    is_active:  { type: Boolean, default: true },
    applicableCategories: [{ type: Schema.Types.ObjectId, ref: 'categories', default: null }],
    applicableProducts: [{ type: Schema.Types.ObjectId, ref: 'Product', default: null }],
  },
  { timestamps: true }
);

const Coupon = model<ICoupon>('Coupon', couponSchema);

export default Coupon;
