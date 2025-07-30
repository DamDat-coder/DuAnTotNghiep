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
exports.hideCoupon = exports.updateCoupon = exports.createCoupon = exports.getCouponById = exports.getAllCoupons = void 0;
const coupon_model_1 = __importDefault(require("../models/coupon.model"));
const notification_model_1 = __importDefault(require("../models/notification.model"));
const mongoose_1 = __importDefault(require("mongoose"));
// Lấy tất cả coupon
const getAllCoupons = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { isActive, search, page = "1", limit = "10" } = req.query;
        yield coupon_model_1.default.updateMany({ is_active: true, endDate: { $lt: new Date() } }, { $set: { is_active: false } });
        const filter = {};
        if (isActive !== undefined) {
            filter.is_active = isActive === "true";
        }
        if (search) {
            filter.code = { $regex: search, $options: "i" };
        }
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        const skip = (pageNumber - 1) * limitNumber;
        const total = yield coupon_model_1.default.countDocuments(filter);
        const coupons = yield coupon_model_1.default.find(filter)
            .populate("applicableCategories", "name")
            .populate("applicableProducts", "name")
            .skip(skip)
            .limit(limitNumber)
            .sort({ createdAt: -1 });
        res.status(200).json({
            data: coupons,
            pagination: {
                total,
                page: pageNumber,
                limit: limitNumber,
                totalPages: Math.ceil(total / limitNumber),
            },
        });
    }
    catch (error) {
        console.error("Lỗi khi lấy danh sách coupon:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message || error });
    }
});
exports.getAllCoupons = getAllCoupons;
// Lấy coupon theo ID
const getCouponById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const coupon = yield coupon_model_1.default.findById(req.params.id)
            .populate("applicableCategories", "name")
            .populate("applicableProducts", "name");
        if (!coupon) {
            return res.status(404).json({ message: "Không tìm thấy mã giảm giá" });
        }
        res.status(200).json(coupon);
    }
    catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message || error });
    }
});
exports.getCouponById = getCouponById;
// Tạo coupon mới
const createCoupon = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { code, description, discountType, discountValue, minOrderAmount, maxDiscountAmount, startDate, endDate, usageLimit, perUserLimit, is_active, applicableCategories, applicableProducts, } = req.body;
        const existing = yield coupon_model_1.default.findOne({ code });
        if (existing) {
            return res.status(400).json({ message: "Mã giảm giá đã tồn tại" });
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
            perUserLimit: perUserLimit !== null && perUserLimit !== void 0 ? perUserLimit : null,
            usedCount: 0,
            is_active: is_active !== null && is_active !== void 0 ? is_active : true,
            applicableCategories: (applicableCategories || []).map((id) => new mongoose_1.default.Types.ObjectId(id)),
            applicableProducts: (applicableProducts || []).map((id) => new mongoose_1.default.Types.ObjectId(id)),
        });
        yield newCoupon.save();
        yield notification_model_1.default.create({
            userId: null,
            title: "Mã giảm giá mới vừa được xuất bản!",
            message: `Mã "${code}" hiện đã có hiệu lực từ ngày ${new Date(startDate).toLocaleDateString("vi-VN")}.`,
            type: "coupon",
            link: `/coupons`,
            isRead: false,
        });
        res.status(201).json({ message: "Tạo mã giảm giá thành công", data: newCoupon });
    }
    catch (error) {
        console.error("Error creating coupon:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message || error });
    }
});
exports.createCoupon = createCoupon;
// Cập nhật coupon
const updateCoupon = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { code, description, discountType, discountValue, minOrderAmount, maxDiscountAmount, startDate, endDate, usageLimit, perUserLimit, is_active, applicableCategories, applicableProducts, } = req.body;
        const coupon = yield coupon_model_1.default.findById(req.params.id);
        if (!coupon) {
            return res.status(404).json({ message: "Không tìm thấy mã giảm giá" });
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
        coupon.perUserLimit = perUserLimit !== null && perUserLimit !== void 0 ? perUserLimit : coupon.perUserLimit;
        coupon.is_active = is_active !== null && is_active !== void 0 ? is_active : coupon.is_active;
        if (applicableCategories)
            coupon.applicableCategories = applicableCategories.map((id) => new mongoose_1.default.Types.ObjectId(id));
        if (applicableProducts)
            coupon.applicableProducts = applicableProducts.map((id) => new mongoose_1.default.Types.ObjectId(id));
        yield coupon.save();
        res.status(200).json({ message: "Cập nhật thành công", data: coupon });
    }
    catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message || error });
    }
});
exports.updateCoupon = updateCoupon;
// Ẩn coupon (ngừng hoạt động)
const hideCoupon = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const coupon = yield coupon_model_1.default.findById(req.params.id);
        if (!coupon) {
            return res.status(404).json({ message: "Không tìm thấy mã giảm giá để ẩn" });
        }
        if (!coupon.is_active) {
            return res.status(400).json({ message: "Mã giảm giá đã bị ẩn trước đó" });
        }
        coupon.is_active = false;
        yield coupon.save();
        res.status(200).json({ message: "Đã ẩn mã giảm giá thành công" });
    }
    catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message || error });
    }
});
exports.hideCoupon = hideCoupon;
