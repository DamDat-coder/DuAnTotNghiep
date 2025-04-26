"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCouponFields = void 0;
// Hàm validate các trường bắt buộc của coupon
const validateCouponFields = (coupon) => {
    if (!coupon.code || !coupon.discountType || !coupon.discountValue || !coupon.startDate || !coupon.endDate) {
        return 'Missing required fields';
    }
    return null;
};
exports.validateCouponFields = validateCouponFields;
