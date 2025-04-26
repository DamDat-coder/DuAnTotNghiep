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
exports.deleteCoupon = exports.updateCoupon = exports.getCouponById = exports.createCoupon = exports.getAllCoupons = void 0;
const couponsModel_1 = __importDefault(require("../models/couponsModel"));
const validateCouponFields_1 = require("../utils/validateCouponFields");
// Lấy tất cả coupons (có pagination)
const getAllCoupons = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = '1', limit = '10', status } = req.query;
        const query = status ? { status } : {};
        const coupons = yield couponsModel_1.default.find(query)
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .sort({ createdAt: -1 });
        const total = yield couponsModel_1.default.countDocuments(query);
        res.json({
            coupons,
            totalPages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page)
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getAllCoupons = getAllCoupons;
// Tạo mới coupon
const createCoupon = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { code, description, discountType, discountValue, minOrderAmount, maxDiscountAmount, startDate, endDate, usageLimit } = req.body;
        // Validation cơ bản
        const validationError = (0, validateCouponFields_1.validateCouponFields)({ code, discountType, discountValue, startDate, endDate });
        if (validationError) {
            res.status(400).json({ message: validationError });
            return;
        }
        const coupon = new couponsModel_1.default({
            code,
            description,
            discountType,
            discountValue,
            minOrderAmount,
            maxDiscountAmount,
            startDate,
            endDate,
            usageLimit,
            status: 'active'
        });
        const newCoupon = yield coupon.save();
        res.status(201).json(newCoupon);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.createCoupon = createCoupon;
// Lấy coupon theo ID
const getCouponById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const coupon = yield couponsModel_1.default.findById(req.params.id);
        if (!coupon) {
            res.status(404).json({ message: 'Coupon not found' });
            return;
        }
        res.json(coupon);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getCouponById = getCouponById;
// Cập nhật coupon
const updateCoupon = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const coupon = yield couponsModel_1.default.findById(req.params.id);
        if (!coupon) {
            res.status(404).json({ message: 'Coupon not found' });
            return;
        }
        // Cập nhật các trường nếu có trong request body
        const fields = [
            'code', 'description', 'discountType', 'discountValue',
            'minOrderAmount', 'maxDiscountAmount', 'startDate', 'endDate',
            'usageLimit', 'status'
        ];
        fields.forEach(field => {
            if (req.body[field] !== undefined) {
                coupon[field] = req.body[field];
            }
        });
        // Kiểm tra logic nghiệp vụ
        if (coupon.usedCount && coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            coupon.status = 'inactive';
        }
        if (new Date(coupon.endDate) < new Date()) {
            coupon.status = 'inactive';
        }
        const updatedCoupon = yield coupon.save();
        res.json(updatedCoupon);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.updateCoupon = updateCoupon;
// Xóa coupon (soft delete)
const deleteCoupon = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const coupon = yield couponsModel_1.default.findById(req.params.id);
        if (!coupon) {
            res.status(404).json({ message: 'Coupon not found' });
            return;
        }
        // Soft delete: chỉ cập nhật status
        coupon.status = 'inactive';
        yield coupon.save();
        res.json({ message: 'Coupon deactivated' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.deleteCoupon = deleteCoupon;
