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
exports.createCodPayment = exports.checkZaloPayReturn = exports.createZaloPayPayment = exports.checkVNPayReturn = exports.createVNPayPayment = void 0;
const vnpay_1 = require("vnpay");
const moment_1 = __importDefault(require("moment"));
const payment_model_1 = __importDefault(require("../models/payment.model"));
const order_model_1 = __importDefault(require("../models/order.model"));
const product_model_1 = __importDefault(require("../models/product.model"));
const mongoose_1 = require("mongoose");
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
const payment_config_1 = require("../config/payment.config");
// Tạo URL thanh toán VNPay
const createVNPayPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orderId, totalPrice, userId, orderInfo, shipping } = req.body;
        if (!orderId || !totalPrice || !userId || !orderInfo) {
            return res
                .status(400)
                .json({ message: "Thiếu orderId, totalPrice, userId hoặc orderInfo!" });
        }
        const paymentData = {
            userId: new mongoose_1.Types.ObjectId(userId),
            amount: totalPrice,
            status: "pending",
            transaction_code: orderId,
            transaction_data: {},
            paid_at: undefined,
            order_info: Object.assign(Object.assign({}, orderInfo), { shipping: shipping !== null && shipping !== void 0 ? shipping : 0 }),
        };
        const payment = yield payment_model_1.default.create(paymentData);
        const paymentUrl = yield payment_config_1.vnpay.buildPaymentUrl({
            vnp_Amount: totalPrice,
            vnp_IpAddr: req.ip || "127.0.0.1",
            vnp_TxnRef: orderId,
            vnp_OrderInfo: `Thanh toán đơn hàng ${orderId}|userId:${userId}`,
            vnp_OrderType: vnpay_1.ProductCode.Other,
            vnp_ReturnUrl: `http://localhost:3000/api/payment/check-payment-vnpay`,
            vnp_Locale: vnpay_1.VnpLocale.VN,
            vnp_CreateDate: Number((0, moment_1.default)().format("YYYYMMDDHHmmss")),
            vnp_ExpireDate: Number((0, moment_1.default)().add(30, "minutes").format("YYYYMMDDHHmmss")),
        });
        return res.status(200).json({ paymentUrl, paymentId: payment._id });
    }
    catch (error) {
        return res
            .status(500)
            .json({ message: "Không tạo được URL thanh toán", error });
    }
});
exports.createVNPayPayment = createVNPayPayment;
// Xử lý callback từ VNPay
const checkVNPayReturn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const queryParams = req.query;
        const isValid = payment_config_1.vnpay.verifyReturnUrl(queryParams);
        if (!isValid) {
            return res.status(400).json({ message: "Chữ ký không hợp lệ!" });
        }
        const { vnp_TxnRef, vnp_ResponseCode, vnp_PayDate } = queryParams;
        const payment = yield payment_model_1.default.findOne({ transaction_code: vnp_TxnRef });
        if (!payment) {
            return res
                .status(404)
                .json({ message: "Không tìm thấy giao dịch để cập nhật!" });
        }
        payment.status = vnp_ResponseCode === "00" ? "success" : "failed";
        payment.transaction_data = queryParams;
        payment.paid_at = vnp_PayDate
            ? (0, moment_1.default)(vnp_PayDate, "YYYYMMDDHHmmss").toDate()
            : new Date();
        yield payment.save();
        if (vnp_ResponseCode === "00") {
            const orderInfo = payment.order_info;
            for (const item of orderInfo.items) {
                const product = yield product_model_1.default.findById(item.productId);
                if (!product)
                    continue;
                const variant = product.variants.find((v) => v.color === item.color && v.size === item.size);
                if (!variant)
                    continue;
                variant.stock = Math.max(variant.stock - item.quantity, 0);
                product.salesCount += item.quantity;
                yield product.save();
            }
            yield order_model_1.default.create({
                userId: payment.userId,
                couponId: orderInfo.couponId || null,
                address_id: orderInfo.address_id,
                shippingAddress: orderInfo.shippingAddress,
                totalPrice: payment.amount,
                shipping: orderInfo.shipping || 0,
                status: "pending",
                paymentMethod: "vnpay",
                paymentStatus: "paid",
                note: orderInfo.note || "",
                items: orderInfo.items.map((i) => {
                    var _a;
                    return ({
                        productId: i.productId,
                        name: i.name,
                        image: i.image,
                        color: i.color,
                        size: i.size,
                        quantity: i.quantity,
                        price: (_a = i.price) !== null && _a !== void 0 ? _a : 0,
                    });
                }),
            });
        }
        const redirectBase = "http://localhost:3300/payment";
        return res.redirect(vnp_ResponseCode === "00"
            ? `${redirectBase}/success?orderId=${vnp_TxnRef}`
            : `${redirectBase}/fail?orderId=${vnp_TxnRef}`);
    }
    catch (error) {
        return res.status(500).json({ message: "Xử lý callback thất bại!", error });
    }
});
exports.checkVNPayReturn = checkVNPayReturn;
// Tạo URL thanh toán ZaloPay
const createZaloPayPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { totalPrice, userId, orderInfo, shipping } = req.body;
        if (!totalPrice || !userId || !orderInfo) {
            return res.status(400).json({ message: "Thiếu thông tin thanh toán!" });
        }
        const orderId = (0, moment_1.default)().format("YYMMDD_HHmmss");
        const payment = yield payment_model_1.default.create({
            userId: new mongoose_1.Types.ObjectId(userId),
            amount: totalPrice,
            status: "pending",
            transaction_code: orderId,
            transaction_data: {},
            order_info: Object.assign(Object.assign({}, orderInfo), { shipping: shipping !== null && shipping !== void 0 ? shipping : 0 }),
        });
        const embed_data = {
            redirecturl: `http://localhost:3000/api/payment/check-payment-zalopay`,
        };
        const order = {
            app_id: payment_config_1.ZALO_PAY.app_id,
            app_trans_id: orderId,
            app_user: userId.toString(),
            app_time: Date.now(),
            amount: Math.floor(totalPrice),
            item: JSON.stringify([]),
            embed_data: JSON.stringify(embed_data),
            description: `Thanh toán Style For You #${orderId}`,
            callback_url: payment_config_1.ZALO_PAY.callbackUrl,
            bank_code: "zalopayapp",
        };
        const dataString = [
            order.app_id,
            order.app_trans_id,
            order.app_user,
            order.amount,
            order.app_time,
            order.embed_data,
            order.item,
        ].join("|");
        order.mac = crypto_1.default
            .createHmac("sha256", payment_config_1.ZALO_PAY.key1)
            .update(dataString)
            .digest("hex");
        const params = new URLSearchParams();
        Object.entries(order).forEach(([key, value]) => {
            params.append(key, value);
        });
        const zaloRes = yield axios_1.default.post(payment_config_1.ZALO_PAY.endpoint, params.toString(), {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
        if (zaloRes.data.return_code !== 1) {
            return res.status(400).json({
                message: "Tạo đơn ZaloPay thất bại!",
                zaloRes: zaloRes.data,
            });
        }
        return res.status(200).json({
            paymentUrl: zaloRes.data.order_url,
            paymentId: payment._id,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Không tạo được đơn ZaloPay",
            error: error instanceof Error ? error.message : error,
        });
    }
});
exports.createZaloPayPayment = createZaloPayPayment;
// Xử lý callback từ ZaloPay
const checkZaloPayReturn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { app_id, app_trans_id, app_time, app_user, amount, embed_data, item, description, status, message, trans_id, mac, } = req.body;
        const dataString = [
            app_id,
            app_trans_id,
            app_user,
            amount,
            app_time,
            embed_data,
            item,
            status,
            message,
            trans_id,
        ].join("|");
        const expectedMac = crypto_1.default
            .createHmac("sha256", payment_config_1.ZALO_PAY.key1)
            .update(dataString)
            .digest("hex");
        if (mac !== expectedMac) {
            return res
                .status(400)
                .json({ return_code: -1, return_message: "Chữ ký không hợp lệ!" });
        }
        const payment = yield payment_model_1.default.findOne({ transaction_code: app_trans_id });
        if (!payment) {
            return res
                .status(404)
                .json({ return_code: -1, return_message: "Không tìm thấy giao dịch!" });
        }
        const isSuccess = status === 1;
        payment.status = isSuccess ? "success" : "failed";
        payment.transaction_data = req.body;
        payment.paid_at = new Date();
        yield payment.save();
        if (isSuccess) {
            const orderInfo = payment.order_info;
            for (const item of orderInfo.items) {
                const product = yield product_model_1.default.findById(item.productId);
                if (!product)
                    continue;
                const variant = product.variants.find((v) => v.color === item.color && v.size === item.size);
                if (!variant)
                    continue;
                variant.stock = Math.max(variant.stock - item.quantity, 0);
                product.salesCount += item.quantity;
                yield product.save();
            }
            yield order_model_1.default.create({
                userId: payment.userId,
                couponId: orderInfo.couponId || null,
                address_id: orderInfo.address_id,
                shippingAddress: orderInfo.shippingAddress,
                totalPrice: payment.amount,
                shipping: orderInfo.shipping || 0,
                status: "pending",
                paymentMethod: "zalopay",
                paymentStatus: "paid",
                note: orderInfo.note || "",
                items: orderInfo.items.map((i) => {
                    var _a;
                    return ({
                        productId: i.productId,
                        name: i.name,
                        image: i.image,
                        color: i.color,
                        size: i.size,
                        quantity: i.quantity,
                        price: (_a = i.price) !== null && _a !== void 0 ? _a : 0,
                    });
                }),
            });
        }
        const redirectBase = "http://localhost:3300/payment";
        const redirectUrl = isSuccess
            ? `${redirectBase}/success?orderId=${app_trans_id}`
            : `${redirectBase}/fail?orderId=${app_trans_id}`;
        return res.redirect(redirectUrl);
    }
    catch (error) {
        return res
            .status(500)
            .json({ return_code: -1, return_message: "Xử lý callback thất bại!" });
    }
});
exports.checkZaloPayReturn = checkZaloPayReturn;
const createCodPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orderId, totalPrice, userId, orderInfo } = req.body;
        if (!userId || !totalPrice || !orderInfo) {
            return res.status(400).json({ message: "Thiếu thông tin thanh toán!" });
        }
        const payment = yield payment_model_1.default.create({
            userId: new mongoose_1.Types.ObjectId(userId), // 👈 đảm bảo đúng kiểu
            amount: totalPrice,
            status: "success",
            transaction_code: orderId,
            transaction_data: {}, // 👈 thêm field này để thống nhất schema
            order_info: orderInfo,
            paid_at: new Date(),
        });
        return res.status(200).json({
            paymentId: payment._id,
            message: "Tạo thanh toán COD thành công",
        });
    }
    catch (error) {
        console.error("Lỗi tạo COD payment:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
});
exports.createCodPayment = createCodPayment;
