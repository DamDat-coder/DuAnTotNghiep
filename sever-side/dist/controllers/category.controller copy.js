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
exports.createOrder = void 0;
const order_model_1 = __importDefault(require("../models/order.model"));
const coupon_model_1 = __importDefault(require("../models/coupon.model"));
const product_model_1 = __importDefault(require("../models/product.model")); // để kiểm tra giá và cập nhật tồn kho
// Tạo đơn hàng
const createOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, address_id, shippingAddress, couponId, items, // [{ product_variant_id, quantity, price }]
         } = req.body;
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: "Đơn hàng phải có ít nhất 1 sản phẩm." });
        }
        // Tính tổng giá
        let total = 0;
        for (const item of items) {
            const product = yield product_model_1.default.findById(item.product_variant_id);
            if (!product) {
                return res.status(400).json({ success: false, message: "Sản phẩm không tồn tại." });
            }
            const variant = product.variants.find((v) => v._id.toString() === item.product_variant_id);
            if (!variant || variant.stock < item.quantity) {
                return res.status(400).json({ success: false, message: "Không đủ hàng trong kho." });
            }
            total += item.quantity * item.price;
        }
        // Áp dụng mã giảm giá nếu có
        if (couponId) {
            const coupon = yield coupon_model_1.default.findById(couponId);
            if (!coupon || !coupon.is_active) {
                return res.status(400).json({ success: false, message: "Mã giảm giá không hợp lệ." });
            }
            const now = new Date();
            if (now < coupon.startDate || now > coupon.endDate) {
                return res.status(400).json({ success: false, message: "Mã giảm giá đã hết hạn hoặc chưa bắt đầu." });
            }
            if (coupon.minOrderAmount && total < coupon.minOrderAmount) {
                return res.status(400).json({ success: false, message: `Đơn hàng phải trên ${coupon.minOrderAmount}đ để dùng mã giảm giá.` });
            }
            let discount = 0;
            if (coupon.discountType === "percent") {
                discount = total * (coupon.discountValue / 100);
                if (coupon.maxDiscountAmount) {
                    discount = Math.min(discount, coupon.maxDiscountAmount);
                }
            }
            else if (coupon.discountType === "fixed") {
                discount = coupon.discountValue;
            }
            total -= discount;
            // Tăng số lần dùng
            coupon.usedCount = (coupon.usedCount || 0) + 1;
            yield coupon.save();
        }
        // Tạo đơn hàng
        const newOrder = yield order_model_1.default.create({
            userId,
            address_id,
            shippingAddress,
            couponId: couponId || null,
            totalPrice: total,
            status: "pending",
            items,
        });
        res.status(201).json({
            success: true,
            message: "Tạo đơn hàng thành công.",
            data: newOrder,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.createOrder = createOrder;
