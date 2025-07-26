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
const mongoose_1 = __importDefault(require("mongoose"));
const order_model_1 = __importDefault(require("../models/order.model"));
const product_model_1 = __importDefault(require("../models/product.model"));
const payment_model_1 = __importDefault(require("../models/payment.model"));
const notification_model_1 = __importDefault(require("../models/notification.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const mailer_1 = require("../utils/mailer");
const generateTransactionCode_1 = require("../utils/generateTransactionCode");
// Tạo đơn hàng
const createOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { paymentId, order_info } = req.body;
        let userId;
        let paymentMethod;
        let shippingAddress;
        let items;
        let shipping = 0;
        let discountAmount = 0;
        if (paymentId) {
            const payment = yield payment_model_1.default.findById(paymentId);
            if (!payment || !payment.order_info || !payment.userId) {
                return res.status(400).json({ success: false, message: 'Thông tin thanh toán không hợp lệ.' });
            }
            if (payment.status !== 'success') {
                return res.status(400).json({ success: false, message: 'Thanh toán chưa hoàn tất.' });
            }
            const existed = yield order_model_1.default.findOne({ paymentId });
            if (existed) {
                return res.status(409).json({ success: false, message: 'Đơn hàng đã được tạo từ giao dịch này.' });
            }
            ({ paymentMethod, shippingAddress, items, shipping = 0, discountAmount = 0 } = payment.order_info);
            userId = payment.userId;
        }
        else {
            if (!order_info) {
                return res.status(400).json({ success: false, message: 'Thiếu thông tin đơn hàng.' });
            }
            ({ paymentMethod, userId, shippingAddress, items, shipping = 0, discountAmount = 0 } = order_info);
            if (paymentMethod !== 'cod') {
                return res.status(400).json({ success: false, message: 'Phương thức thanh toán không hợp lệ.' });
            }
        }
        const orderItems = [];
        let totalPrice = 0;
        for (const item of items) {
            const product = yield product_model_1.default.findById(item.product || item.productId);
            if (!product) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm.' });
            }
            const variantData = item.variant || item;
            const variant = product.variants.find(v => v.color === variantData.color && v.size === variantData.size);
            if (!variant || variant.stock < item.quantity) {
                return res.status(400).json({ success: false, message: 'Biến thể không hợp lệ hoặc hết hàng.' });
            }
            const discountPrice = variant.price * (1 - variant.discountPercent / 100);
            totalPrice += discountPrice * item.quantity;
            orderItems.push({
                productId: product._id,
                name: product.name,
                image: product.image[0] || '',
                color: variantData.color,
                size: variantData.size,
                price: discountPrice,
                quantity: item.quantity,
            });
            variant.stock -= item.quantity;
            product.salesCount += item.quantity;
            yield product.save();
        }
        totalPrice -= discountAmount;
        totalPrice += shipping;
        const orderCode = yield (0, generateTransactionCode_1.generateUniqueTransactionCode)("CD");
        const order = yield order_model_1.default.create({
            userId,
            shippingAddress,
            totalPrice,
            discountAmount,
            shipping,
            paymentMethod,
            items: orderItems,
            paymentId: paymentId || null,
            orderCode,
        });
        yield notification_model_1.default.create({
            userId,
            title: 'Đơn hàng của bạn đã được tạo thành công!',
            message: `Đơn hàng #${order.orderCode} đã được xác nhận.`,
            type: 'order',
            isRead: false,
            link: `/profile?tab=order/${order._id}`,
        });
        const admins = yield user_model_1.default.find({ role: 'admin' }).select('_id').lean();
        const notis = admins.map(admin => ({
            userId: admin._id,
            title: 'Có đơn hàng mới!',
            message: `Đơn hàng #${order.orderCode} vừa được tạo.`,
            type: 'order',
            isRead: false,
        }));
        yield notification_model_1.default.insertMany(notis);
        return res.status(201).json({ success: true, message: 'Tạo đơn hàng thành công.', data: order });
    }
    catch (err) {
        console.error('Lỗi tạo đơn hàng:', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
    }
});
exports.createOrder = createOrder;
// Lấy tất cả đơn hàng (Admin)
const getOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = "1", limit = "10", search, status, } = req.query;
        const pageNum = Math.max(parseInt(page), 1);
        const limitNum = Math.max(parseInt(limit), 1);
        const skip = (pageNum - 1) * limitNum;
        const query = {};
        if (status) {
            query.status = status;
        }
        if (search) {
            const users = yield user_model_1.default.find({
                name: { $regex: search, $options: "i" },
            }).select("_id");
            const userIds = users.map((user) => user._id);
            query.userId = { $in: userIds };
        }
        const [orders, total] = yield Promise.all([
            order_model_1.default.find(query)
                .populate("userId", "name email")
                .populate("paymentId", "amount status paymentMethod")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum),
            order_model_1.default.countDocuments(query),
        ]);
        res.status(200).json({
            success: true,
            data: orders,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    }
    catch (err) {
        console.error("Lỗi khi lấy đơn hàng:", err);
        res.status(500).json({
            success: false,
            message: "Lỗi máy chủ.",
            error: err.message,
        });
    }
});
exports.getOrders = getOrders;
// Lấy đơn hàng theo người dùng
const getOrdersByUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.userId;
        const orders = yield order_model_1.default.find({ userId })
            .populate("paymentId", "amount status paymentMethod")
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
            .populate("paymentId", "amount status paymentMethod");
        if (!order) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng." });
        }
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
        const { id } = req.params;
        const { status } = req.body;
        const validStatuses = ["pending", "confirmed", "shipping", "delivered", "cancelled", "fake"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: "Trạng thái không hợp lệ." });
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "ID đơn hàng không hợp lệ." });
        }
        const order = yield order_model_1.default.findByIdAndUpdate(id, { status }, { new: true }).populate("userId", "name email");
        if (!order || !order.userId) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng." });
        }
        const user = order.userId;
        yield notification_model_1.default.create({
            userId: user._id,
            title: `Đơn hàng #${order._id} đã được cập nhật`,
            message: `Trạng thái đơn hàng của bạn hiện tại là: ${status}.`,
            type: "order",
            isRead: false,
            link: `/profile?tab=order/${order._id}`,
        });
        if (status === "fake") {
            const fakeOrderCount = yield order_model_1.default.countDocuments({
                userId: user._id,
                status: "fake",
            });
            if (fakeOrderCount === 1) {
                yield (0, mailer_1.sendOrderSpamWarningEmail)(user.email, user.name);
                yield notification_model_1.default.create({
                    userId: user._id,
                    title: "Cảnh báo hành vi giả mạo",
                    message: "Đơn hàng của bạn đã bị đánh dấu là giả mạo. Nếu tiếp tục, tài khoản có thể bị khóa.",
                    type: "warning",
                    isRead: false,
                    link: "/profile?tab=order",
                });
            }
            if (fakeOrderCount >= 3) {
                yield user_model_1.default.findByIdAndUpdate(user._id, { is_active: false });
                yield (0, mailer_1.sendAccountBlockedEmail)(user.email, user.name);
                yield notification_model_1.default.create({
                    userId: user._id,
                    title: "Tài khoản bị khóa",
                    message: "Tài khoản của bạn đã bị khóa vì có quá nhiều đơn hàng giả mạo.",
                    type: "lock",
                    isRead: false,
                    link: "/profile",
                });
            }
        }
        return res.status(200).json({
            success: true,
            message: "Cập nhật trạng thái thành công.",
            data: order,
        });
    }
    catch (err) {
        console.error("Lỗi cập nhật đơn:", err);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ." });
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
