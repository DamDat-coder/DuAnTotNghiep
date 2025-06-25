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
exports.cancelOrder = exports.updateOrderStatus = exports.getOrderById = exports.getOrdersByUser = exports.getOrders = exports.createOrder = void 0;
const order_model_1 = __importDefault(require("../models/order.model"));
const product_model_1 = __importDefault(require("../models/product.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const coupon_model_1 = __importDefault(require("../models/coupon.model"));
// Tạo đơn hàng
const createOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { userId, address_id, shippingAddress, couponId, items } = req.body;
        const user = yield user_model_1.default.findById(userId);
        if (!user)
            return res.status(404).json({ success: false, message: "Người dùng không tồn tại." });
        const orderItems = [];
        let totalPrice = 0;
        for (const item of items) {
            const product = yield product_model_1.default.findById(item.productId);
            if (!product)
                return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm." });
            const variant = product.variants.find((v) => v.color === item.color && v.size === item.size);
            if (!variant)
                return res.status(400).json({ success: false, message: "Biến thể không hợp lệ." });
            if (variant.stock < item.quantity) {
                return res.status(400).json({ success: false, message: `Sản phẩm ${product.name} không đủ hàng.` });
            }
            const discountPrice = variant.price * (1 - variant.discountPercent / 100);
            const itemTotal = discountPrice * item.quantity;
            totalPrice += itemTotal;
            orderItems.push({
                productId: product._id,
                name: product.name,
                image: product.image[0] || "",
                color: item.color,
                size: item.size,
                price: discountPrice,
                quantity: item.quantity,
            });
            variant.stock -= item.quantity;
            product.salesCount += item.quantity;
            yield product.save();
        }
        // Xử lý mã giảm giá
        if (couponId) {
            const coupon = yield coupon_model_1.default.findById(couponId);
            if (!coupon || !coupon.is_active) {
                return res.status(400).json({ success: false, message: "Mã giảm giá không hợp lệ hoặc không hoạt động." });
            }
            const now = new Date();
            if (now < coupon.startDate || now > coupon.endDate) {
                return res.status(400).json({ success: false, message: "Mã giảm giá không còn hiệu lực." });
            }
            const usedCount = (_a = coupon.usedCount) !== null && _a !== void 0 ? _a : 0;
            const usageLimit = (_b = coupon.usageLimit) !== null && _b !== void 0 ? _b : null;
            if (usageLimit !== null && usedCount >= usageLimit) {
                return res.status(400).json({ success: false, message: "Mã giảm giá đã hết lượt sử dụng." });
            }
            if (coupon.minOrderAmount && totalPrice < coupon.minOrderAmount) {
                return res.status(400).json({
                    success: false,
                    message: `Đơn hàng cần đạt tối thiểu ${coupon.minOrderAmount}đ để áp dụng mã.`,
                });
            }
            let discountAmount = 0;
            if (coupon.discountType === "percent") {
                discountAmount = (totalPrice * coupon.discountValue) / 100;
            }
            else {
                discountAmount = coupon.discountValue;
            }
            if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
                discountAmount = coupon.maxDiscountAmount;
            }
            totalPrice -= discountAmount;
            coupon.usedCount = usedCount + 1;
            yield coupon.save();
        }
        const order = yield order_model_1.default.create({
            userId,
            address_id,
            shippingAddress,
            couponId: couponId || null,
            totalPrice,
            items: orderItems,
        });
        res.status(201).json({ success: true, message: "Đặt hàng thành công.", data: order });
    }
    catch (err) {
        next(err);
    }
});
exports.createOrder = createOrder;
// Lấy tất cả đơn hàng (Admin)
const getOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orders = yield order_model_1.default.find()
            .populate("userId", "name email")
            .populate("couponId", "code discountValue")
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: orders });
    }
    catch (err) {
        res.status(500).json({ success: false, message: "Lỗi máy chủ." });
    }
});
exports.getOrders = getOrders;
// Lấy đơn hàng theo người dùng
const getOrdersByUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.userId;
        const orders = yield order_model_1.default.find({ userId })
            .populate("couponId", "code discountValue")
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: orders });
    }
    catch (err) {
        res.status(500).json({ success: false, message: "Lỗi máy chủ." });
    }
});
exports.getOrdersByUser = getOrdersByUser;
// Lấy đơn hàng theo ID
const getOrderById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield order_model_1.default.findById(req.params.id)
            .populate("userId", "name email")
            .populate("couponId", "code discountValue");
        if (!order)
            return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng." });
        res.status(200).json({ success: true, data: order });
    }
    catch (err) {
        res.status(500).json({ success: false, message: "Lỗi máy chủ." });
    }
});
exports.getOrderById = getOrderById;
// Cập nhật trạng thái đơn hàng
const updateOrderStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = req.body;
        const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: "Trạng thái không hợp lệ." });
        }
        const order = yield order_model_1.default.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!order) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng." });
        }
        res.status(200).json({ success: true, message: "Cập nhật trạng thái thành công.", data: order });
    }
    catch (err) {
        res.status(500).json({ success: false, message: "Lỗi máy chủ." });
    }
});
exports.updateOrderStatus = updateOrderStatus;
// Huỷ đơn hàng (người dùng)
const cancelOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield order_model_1.default.findById(req.params.id);
        if (!order)
            return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng." });
        if (order.status !== "pending") {
            return res.status(400).json({ success: false, message: "Chỉ có thể huỷ đơn hàng đang chờ xử lý." });
        }
        order.status = "cancelled";
        yield order.save();
        res.status(200).json({ success: true, message: "Huỷ đơn hàng thành công.", data: order });
    }
    catch (err) {
        res.status(500).json({ success: false, message: "Lỗi máy chủ." });
    }
});
exports.cancelOrder = cancelOrder;
