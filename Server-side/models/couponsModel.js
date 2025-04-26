"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const couponSchema = new mongoose_1.Schema({
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
const Coupon = (0, mongoose_1.model)('Coupon', couponSchema);
exports.default = Coupon;
