import { ICoupon } from '../models/couponsModel';

// Hàm validate các trường bắt buộc của coupon
export const validateCouponFields = (coupon: Partial<ICoupon>): string | null => {
    if (!coupon.code || !coupon.discountType || !coupon.discountValue || !coupon.startDate || !coupon.endDate) {
        return 'Missing required fields';
    }
    return null;
};