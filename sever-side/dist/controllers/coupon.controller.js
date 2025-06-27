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
exports.deleteCoupon = exports.updateCoupon = exports.createCoupon = exports.getCouponById = exports.getAllCoupons = void 0;
const coupon_model_1 = __importDefault(require("../models/coupon.model"));
const mongoose_1 = __importDefault(require("mongoose"));
// Lấy tất cả coupon
const getAllCoupons = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const coupons = yield coupon_model_1.default.find()
            .populate('applicableCategories', 'name')
            .populate('applicableProducts', 'name');
        res.status(200).json(coupons);
    }
    catch (error) {
        console.error("Lỗi khi lấy coupon:", error);
        res.status(500).json({
            message: "Lỗi server",
            error: error.message || error
        });
    }
});
exports.getAllCoupons = getAllCoupons;
// Lấy coupon theo ID
const getCouponById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const coupon = yield coupon_model_1.default.findById(req.params.id)
            .populate('applicableCategories', 'name')
            .populate('applicableProducts', 'name');
        if (!coupon) {
            return res.status(404).json({ message: 'Không tìm thấy mã giảm giá' });
        }
        res.status(200).json(coupon);
    }
    catch (error) {
        res.status(500).json({ message: 'Lỗi server', error });
    }
});
exports.getCouponById = getCouponById;
// Tạo coupon mới
const createCoupon = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { code, description, discountType, discountValue, minOrderAmount, maxDiscountAmount, startDate, endDate, usageLimit, is_active, applicableCategories, applicableProducts, } = req.body;
        // Kiểm tra trùng mã
        const existing = yield coupon_model_1.default.findOne({ code });
        if (existing) {
            return res.status(400).json({ message: 'Mã giảm giá đã tồn tại' });
        }
        const newCoupon = new coupon_model_1.default({
            code,
            description,
            discountType,
            discountValue,
            minOrderAmount: minOrderAmount !== null && minOrderAmount !== void 0 ? minOrderAmount : null,
            maxDiscountAmount: maxDiscountAmount !== null && maxDiscountAmount !== void 0 ? maxDiscountAmount : null,
            startDate,
            endDate,
            usageLimit: usageLimit !== null && usageLimit !== void 0 ? usageLimit : null,
            usedCount: 0,
            is_active: is_active !== null && is_active !== void 0 ? is_active : true,
            applicableCategories: (_a = applicableCategories === null || applicableCategories === void 0 ? void 0 : applicableCategories.map((id) => new mongoose_1.default.Types.ObjectId(id))) !== null && _a !== void 0 ? _a : [],
            applicableProducts: (_b = applicableProducts === null || applicableProducts === void 0 ? void 0 : applicableProducts.map((id) => new mongoose_1.default.Types.ObjectId(id))) !== null && _b !== void 0 ? _b : [],
        });
        yield newCoupon.save();
        res.status(201).json({ message: 'Tạo mã giảm giá thành công', data: newCoupon });
    }
    catch (error) {
        res.status(500).json({ message: 'Lỗi server', error });
    }
});
exports.createCoupon = createCoupon;
// Cập nhật coupon
const updateCoupon = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { code, description, discountType, discountValue, minOrderAmount, maxDiscountAmount, startDate, endDate, usageLimit, is_active, applicableCategories, applicableProducts, } = req.body;
        const coupon = yield coupon_model_1.default.findById(req.params.id);
        if (!coupon) {
            return res.status(404).json({ message: 'Không tìm thấy mã giảm giá' });
        }
        coupon.code = code !== null && code !== void 0 ? code : coupon.code;
        coupon.description = description !== null && description !== void 0 ? description : coupon.description;
        coupon.discountType = discountType !== null && discountType !== void 0 ? discountType : coupon.discountType;
        coupon.discountValue = discountValue !== null && discountValue !== void 0 ? discountValue : coupon.discountValue;
        coupon.minOrderAmount = minOrderAmount !== null && minOrderAmount !== void 0 ? minOrderAmount : coupon.minOrderAmount;
        coupon.maxDiscountAmount = maxDiscountAmount !== null && maxDiscountAmount !== void 0 ? maxDiscountAmount : coupon.maxDiscountAmount;
        coupon.startDate = startDate !== null && startDate !== void 0 ? startDate : coupon.startDate;
        coupon.endDate = endDate !== null && endDate !== void 0 ? endDate : coupon.endDate;
        coupon.usageLimit = usageLimit !== null && usageLimit !== void 0 ? usageLimit : coupon.usageLimit;
        coupon.is_active = is_active !== null && is_active !== void 0 ? is_active : coupon.is_active;
        coupon.applicableCategories =
            (_a = applicableCategories === null || applicableCategories === void 0 ? void 0 : applicableCategories.map((id) => new mongoose_1.default.Types.ObjectId(id))) !== null && _a !== void 0 ? _a : coupon.applicableCategories;
        coupon.applicableProducts =
            (_b = applicableProducts === null || applicableProducts === void 0 ? void 0 : applicableProducts.map((id) => new mongoose_1.default.Types.ObjectId(id))) !== null && _b !== void 0 ? _b : coupon.applicableProducts;
        yield coupon.save();
        res.status(200).json({ message: 'Cập nhật thành công', data: coupon });
    }
    catch (error) {
        res.status(500).json({ message: 'Lỗi server', error });
    }
});
exports.updateCoupon = updateCoupon;
// Xoá coupon
const deleteCoupon = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deleted = yield coupon_model_1.default.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Không tìm thấy mã giảm giá để xoá' });
        }
        res.status(200).json({ message: 'Xoá mã giảm giá thành công' });
    }
    catch (error) {
        res.status(500).json({ message: 'Lỗi server', error });
    }
});
exports.deleteCoupon = deleteCoupon;
