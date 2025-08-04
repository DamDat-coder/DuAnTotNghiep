"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCoupon = void 0;
const coupon_model_1 = __importDefault(require("../models/coupon.model"));
const order_model_1 = __importDefault(require("../models/order.model"));
const category_util_1 = require("../utils/category.util");
const validateCoupon = (_a) => __awaiter(void 0, [_a], void 0, function* ({ code, userId, totalAmount, productIds, categoryIds, }) {
    var _b;
    const coupon = yield coupon_model_1.default.findOne({ code });
    if (!coupon || !coupon.is_active) {
        throw new Error("Mã giảm giá không hợp lệ hoặc không hoạt động");
    }
    const now = new Date();
    if (coupon.startDate && now < coupon.startDate) {
        throw new Error("Mã giảm giá chưa bắt đầu");
    }
    if (coupon.endDate && now > coupon.endDate) {
        throw new Error("Mã giảm giá đã hết hạn");
    }
    if (coupon.usageLimit && ((_b = coupon.usedCount) !== null && _b !== void 0 ? _b : 0) >= coupon.usageLimit) {
        throw new Error("Mã giảm giá đã được sử dụng hết");
    }
    if (coupon.perUserLimit) {
        const usedByUser = yield order_model_1.default.countDocuments({
            userId,
            couponCode: code,
        });
        if (usedByUser >= coupon.perUserLimit) {
            throw new Error("Bạn đã sử dụng mã này quá số lần cho phép");
        }
    }
    const hasProductCondition = Array.isArray(coupon.applicableProducts) && coupon.applicableProducts.length > 0;
    const hasCategoryCondition = Array.isArray(coupon.applicableCategories) && coupon.applicableCategories.length > 0;
    if (hasProductCondition || hasCategoryCondition) {
        let matched = false;
        for (let i = 0; i < productIds.length; i++) {
            const productId = productIds[i];
            const categoryId = categoryIds[i];
            let productMatch = true;
            let categoryMatch = true;
            if (hasProductCondition) {
                productMatch = coupon.applicableProducts.some((p) => p.toString() === productId.toString());
            }
            if (hasCategoryCondition) {
                const expandedCouponCategoryIds = [];
                for (const cat of coupon.applicableCategories) {
                    const childIds = yield (0, category_util_1.getAllChildCategoryIds)(cat.toString());
                    expandedCouponCategoryIds.push(cat.toString(), ...childIds);
                }
                categoryMatch = expandedCouponCategoryIds.includes(categoryId.toString());
            }
            if (productMatch && categoryMatch) {
                matched = true;
                break;
            }
        }
        if (!matched) {
            throw new Error("Mã giảm giá không áp dụng cho sản phẩm hoặc danh mục này");
        }
    }
    if (coupon.minOrderAmount && totalAmount < coupon.minOrderAmount) {
        throw new Error(`Đơn hàng phải có giá trị tối thiểu ${coupon.minOrderAmount.toLocaleString()}đ để áp dụng mã`);
    }
    if (coupon.maxOrderAmount && totalAmount > coupon.maxOrderAmount) {
        throw new Error(`Đơn hàng vượt quá giá trị tối đa ${coupon.maxOrderAmount.toLocaleString()}đ được phép dùng mã này`);
    }
    let discountAmount = 0;
    if (coupon.discountType === "percent") {
        discountAmount = (totalAmount * coupon.discountValue) / 100;
    }
    else if (coupon.discountType === "fixed") {
        discountAmount = coupon.discountValue;
    }
    if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
    }
    if (discountAmount > totalAmount) {
        discountAmount = totalAmount;
    }
    return {
        coupon,
        discountAmount,
        finalPrice: totalAmount - discountAmount,
    };
});
exports.validateCoupon = validateCoupon;
