"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const couponSchema = new mongoose_1.Schema({
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
    is_active: { type: Boolean, default: true },
    applicableCategories: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'categories', default: null }],
    applicableProducts: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Product', default: null }],
}, { timestamps: true });
const Coupon = (0, mongoose_1.model)('Coupon', couponSchema);
exports.default = Coupon;
