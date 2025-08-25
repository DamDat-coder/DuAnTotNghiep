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
exports.applyCoupon = exports.hideCoupon = exports.updateCoupon = exports.createCoupon = exports.getCouponById = exports.getAllCoupons = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const coupon_model_1 = __importDefault(require("../models/coupon.model"));
const notification_model_1 = __importDefault(require("../models/notification.model"));
const product_model_1 = __importDefault(require("../models/product.model"));
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
        res
            .status(500)
            .json({ message: "Lỗi server", error: error.message || error });
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
        res
            .status(500)
            .json({ message: "Lỗi server", error: error.message || error });
    }
});
exports.getCouponById = getCouponById;
// Tạo coupon mới
const createCoupon = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { code, description, discountType, discountValue, minOrderAmount, maxDiscountAmount, startDate, endDate, usageLimit, is_active, applicableCategories, applicableProducts, } = req.body;
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
        res
            .status(201)
            .json({ message: "Tạo mã giảm giá thành công", data: newCoupon });
    }
    catch (error) {
        console.error("Error creating coupon:", error);
        res
            .status(500)
            .json({ message: "Lỗi server", error: error.message || error });
    }
});
exports.createCoupon = createCoupon;
// Cập nhật coupon
const updateCoupon = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { code, description, discountType, discountValue, minOrderAmount, maxDiscountAmount, startDate, endDate, usageLimit, is_active, applicableCategories, applicableProducts, } = req.body;
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
        coupon.startDate =
            startDate === "" || startDate === null
                ? null
                : startDate !== null && startDate !== void 0 ? startDate : coupon.startDate;
        coupon.endDate =
            endDate === "" || endDate === null ? null : endDate !== null && endDate !== void 0 ? endDate : coupon.endDate;
        coupon.usageLimit = usageLimit !== null && usageLimit !== void 0 ? usageLimit : coupon.usageLimit;
        coupon.is_active = is_active !== null && is_active !== void 0 ? is_active : coupon.is_active;
        if (applicableCategories)
            coupon.applicableCategories = applicableCategories.map((id) => new mongoose_1.default.Types.ObjectId(id));
        if (applicableProducts)
            coupon.applicableProducts = applicableProducts.map((id) => new mongoose_1.default.Types.ObjectId(id));
        yield coupon.save();
        res.status(200).json({ message: "Cập nhật thành công", data: coupon });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Lỗi server", error: error.message || error });
    }
});
exports.updateCoupon = updateCoupon;
// Ẩn coupon (ngừng hoạt động)
const hideCoupon = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const coupon = yield coupon_model_1.default.findById(req.params.id);
        if (!coupon) {
            return res
                .status(404)
                .json({ message: "Không tìm thấy mã giảm giá để ẩn" });
        }
        if (!coupon.is_active) {
            return res.status(400).json({ message: "Mã giảm giá đã bị ẩn trước đó" });
        }
        coupon.is_active = false;
        yield coupon.save();
        res.status(200).json({ message: "Đã ẩn mã giảm giá thành công" });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Lỗi server", error: error.message || error });
    }
});
exports.hideCoupon = hideCoupon;
// Áp dụng coupon
const applyCoupon = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { code, items } = req.body;
        if (!code || !items || !Array.isArray(items)) {
            return res
                .status(400)
                .json({ status: "error", message: "Thiếu mã hoặc danh sách sản phẩm" });
        }
        const coupon = yield coupon_model_1.default.findOne({ code });
        if (!coupon || !coupon.is_active) {
            return res
                .status(404)
                .json({
                status: "error",
                message: "Mã giảm giá không tồn tại hoặc không hoạt động",
            });
        }
        const now = new Date();
        if ((coupon.startDate && now < new Date(coupon.startDate)) ||
            (coupon.endDate && now > new Date(coupon.endDate))) {
            return res
                .status(400)
                .json({
                status: "error",
                message: "Mã giảm giá đã hết hạn hoặc chưa bắt đầu",
            });
        }
        if (coupon.usageLimit &&
            coupon.usedCount &&
            coupon.usedCount >= coupon.usageLimit) {
            return res
                .status(400)
                .json({ status: "error", message: "Mã giảm giá đã hết lượt sử dụng" });
        }
        const productIds = items.map((item) => item.productId);
        const products = yield product_model_1.default.find({ _id: { $in: productIds } }).populate("category");
        let totalAmount = 0;
        let itemsWithDiscount = [];
        for (const item of items) {
            const product = products.find((p) => p._id.toString() === item.productId);
            if (!product)
                continue;
            // Sử dụng priceAfterDiscount nếu có, nếu không thì dùng price
            const itemPrice = item.priceAfterDiscount !== undefined
                ? item.priceAfterDiscount
                : item.price;
            const itemTotal = itemPrice * item.quantity;
            totalAmount += itemTotal;
            // Kiểm tra sản phẩm/danh mục có thuộc coupon hay không
            let isApplicable = !coupon.applicableProducts ||
                coupon.applicableProducts.length === 0 ||
                coupon.applicableProducts.some((id) => id.equals(product._id)) ||
                !coupon.applicableCategories ||
                coupon.applicableCategories.length === 0 ||
                coupon.applicableCategories.some((id) => id.equals(product.category._id));
            itemsWithDiscount.push({
                productId: product._id,
                name: product.name,
                quantity: item.quantity,
                price: item.price,
                priceAfterDiscount: itemPrice,
                total: itemTotal,
                isDiscounted: isApplicable,
                itemDiscount: 0,
                totalAfterDiscount: itemTotal,
            });
        }
        // Kiểm tra min/max order dựa trên tổng giá đã giảm
        if (coupon.minOrderAmount && totalAmount < coupon.minOrderAmount) {
            return res
                .status(400)
                .json({
                status: "error",
                message: `Đơn hàng phải tối thiểu ${coupon.minOrderAmount.toLocaleString("vi-VN")} VNĐ để áp dụng mã này`,
            });
        }
        if (coupon.maxOrderAmount && totalAmount > coupon.maxOrderAmount) {
            return res
                .status(400)
                .json({
                status: "error",
                message: `Đơn hàng vượt quá mức tối đa ${coupon.maxOrderAmount.toLocaleString("vi-VN")} VNĐ để áp dụng mã này`,
            });
        }
        // Tính giảm giá
        const applicableItems = itemsWithDiscount.filter((i) => i.isDiscounted);
        let discount = 0;
        if (coupon.discountType === "percent") {
            for (const item of applicableItems) {
                item.itemDiscount = (item.total * coupon.discountValue) / 100;
                discount += item.itemDiscount;
            }
            // Giới hạn giảm tối đa
            if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
                const factor = coupon.maxDiscountAmount / discount;
                discount = coupon.maxDiscountAmount;
                for (const item of applicableItems) {
                    item.itemDiscount = parseFloat((item.itemDiscount * factor).toFixed(2));
                }
            }
        }
        else if (coupon.discountType === "fixed") {
            let totalApplicable = applicableItems.reduce((sum, i) => sum + i.total, 0);
            let remainingDiscount = Math.min(coupon.discountValue, totalApplicable);
            for (const item of applicableItems) {
                const ratio = item.total / totalApplicable;
                item.itemDiscount = parseFloat((remainingDiscount * ratio).toFixed(2));
                discount += item.itemDiscount;
            }
        }
        // Cập nhật giá sau giảm
        for (const item of itemsWithDiscount) {
            const totalAfter = item.total - item.itemDiscount;
            item.totalAfterDiscount = parseFloat(totalAfter.toFixed(2));
            item.priceAfterDiscount = parseFloat((totalAfter / item.quantity).toFixed(2));
        }
        const finalAmount = totalAmount - discount;
        return res.status(200).json({
            status: "success",
            message: "Áp dụng mã thành công",
            data: {
                totalAmount,
                discount,
                finalAmount,
                couponCode: coupon.code,
                items: itemsWithDiscount,
            },
        });
    }
    catch (error) {
        console.error("Lỗi applyCoupon:", error);
        res
            .status(500)
            .json({ status: "error", message: "Lỗi server khi áp dụng mã" });
    }
});
exports.applyCoupon = applyCoupon;
