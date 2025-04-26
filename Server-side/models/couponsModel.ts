import { Document, Schema, model } from 'mongoose';

export interface ICoupon extends Document {
    code: string;
    description: string;
    discountType: string;
    discountValue: number;
    minOrderAmount?: number;
    maxDiscountAmount?: number;
    startDate: Date;
    endDate: Date;
    usageLimit?: number;
    usedCount?: number;
    status: 'active' | 'inactive';
}

const couponSchema = new Schema<ICoupon>({
    code: { type: String, required: true },
    description: { type: String, required: true },
    discountType: { type: String, required: true },
    discountValue: { type: Number, required: true },
    minOrderAmount: { type: Number },
    maxDiscountAmount: { type: Number },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    usageLimit: { type: Number },
    usedCount: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

const Coupon = model<ICoupon>('Coupon', couponSchema);

export default Coupon; 
