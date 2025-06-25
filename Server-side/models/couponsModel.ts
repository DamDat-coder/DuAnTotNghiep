import { Document, Schema, model } from 'mongoose';

export interface ICoupon extends Document {
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    description: string;
    minOrderValue?: number;
    maxDiscount?: number;
    validFrom: Date;
    validUntil: Date;
    usageLimit?: number;
    usedCount?: number;
    isActive: boolean;
    applicableCategories?: Schema.Types.ObjectId[]; 
    applicableProducts?: Schema.Types.ObjectId[];  
}

const couponSchema = new Schema<ICoupon>({
    code: { type: String, required: true, unique: true },
    discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
    discountValue: { type: Number, required: true },
    description: { type: String, required: true },
    minOrderValue: { type: Number },
    maxDiscount: { type: Number },
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    usageLimit: { type: Number },
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    applicableCategories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    applicableProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }]
}, { timestamps: true });

const Coupon = model<ICoupon>('Coupon', couponSchema);

export default Coupon;
