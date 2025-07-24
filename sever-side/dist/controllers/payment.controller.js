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
const mongoose_1 = require("mongoose");
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
const payment_config_1 = require("../config/payment.config");
const generateTransactionCode_1 = require("../utils/generateTransactionCode");
// VNPay - Tạo thanh toán
const createVNPayPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { totalPrice, userId, orderInfo, discountAmount = 0 } = req.body;
        if (!totalPrice || !userId || !orderInfo) {
            return res.status(400).json({ message: "Thiếu thông tin!" });
        }
        const transactionCode = yield (0, generateTransactionCode_1.generateUniqueTransactionCode)("VN");
        const payment = yield payment_model_1.default.create({
            userId: new mongoose_1.Types.ObjectId(userId),
            amount: totalPrice,
            discount_amount: discountAmount,
            status: "pending",
            transaction_code: transactionCode,
            transaction_data: {},
            transaction_summary: {},
            order_info: Object.assign(Object.assign({}, orderInfo), { paymentMethod: "vnpay" }),
            gateway: "vnpay",
        });
        const paymentUrl = yield payment_config_1.vnpay.buildPaymentUrl({
            vnp_Amount: totalPrice,
            vnp_IpAddr: req.ip || "127.0.0.1",
            vnp_TxnRef: transactionCode,
            vnp_OrderInfo: `Thanh toán đơn hàng ${transactionCode}|userId:${userId}`,
            vnp_OrderType: vnpay_1.ProductCode.Other,
            vnp_ReturnUrl: `http://localhost:3000/api/payment/check-payment-vnpay`,
            vnp_Locale: vnpay_1.VnpLocale.VN,
            vnp_CreateDate: Number((0, moment_1.default)().format("YYYYMMDDHHmmss")),
            vnp_ExpireDate: Number((0, moment_1.default)().add(30, "minutes").format("YYYYMMDDHHmmss")),
        });
        return res.status(200).json({ paymentUrl, paymentId: payment._id });
    }
    catch (error) {
        return res.status(500).json({ message: "Không tạo được URL VNPay", error });
    }
});
exports.createVNPayPayment = createVNPayPayment;
// VNPay - Callback xử lý thanh toán
const checkVNPayReturn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const queryParams = req.query;
        const isValid = payment_config_1.vnpay.verifyReturnUrl(queryParams);
        if (!isValid)
            return res.status(400).json({ message: "Chữ ký không hợp lệ!" });
        const { vnp_TxnRef, vnp_ResponseCode, vnp_PayDate, vnp_BankCode, vnp_TransactionNo, } = queryParams;
        const payment = yield payment_model_1.default.findOne({ transaction_code: vnp_TxnRef });
        if (!payment)
            return res.status(404).json({ message: "Không tìm thấy giao dịch!" });
        payment.status = vnp_ResponseCode === "00" ? "success" : "failed";
        payment.paid_at = vnp_PayDate
            ? (0, moment_1.default)(vnp_PayDate, "YYYYMMDDHHmmss").toDate()
            : new Date();
        payment.transaction_data = queryParams;
        payment.transaction_summary = {
            gatewayTransactionId: vnp_TransactionNo === null || vnp_TransactionNo === void 0 ? void 0 : vnp_TransactionNo.toString(),
            bankCode: vnp_BankCode,
            amount: payment.amount,
        };
        yield payment.save();
        const redirect = vnp_ResponseCode === "00" ? "success" : "fail";
        return res.redirect(`http://localhost:3300/payment/${redirect}?orderId=${vnp_TxnRef}`);
    }
    catch (error) {
        return res.status(500).json({ message: "Callback VNPay lỗi!", error });
    }
});
exports.checkVNPayReturn = checkVNPayReturn;
// ZaloPay - Tạo thanh toán
const createZaloPayPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { totalPrice, userId, orderInfo, discountAmount = 0 } = req.body;
        if (!totalPrice || !userId || !orderInfo) {
            return res.status(400).json({ message: "Thiếu thông tin thanh toán!" });
        }
        const datePrefix = (0, moment_1.default)().format("YYMMDD");
        const randomSuffix = Math.floor(Math.random() * 1000000);
        const transactionCode = `${datePrefix}_${randomSuffix}`;
        const app_time = Date.now();
        const embedData = {
            redirecturl: `${payment_config_1.ZALO_PAY.returnUrl}?orderId=${transactionCode}`,
            userId,
        };
        const itemList = orderInfo.items.map((item) => ({
            itemid: item.productId,
            itemname: item.name,
            itemprice: item.price,
            itemquantity: item.quantity,
        }));
        const order = {
            app_id: payment_config_1.ZALO_PAY.appId,
            app_trans_id: transactionCode,
            app_user: `user_${userId.slice(-4)}`, // rút gọn userId
            app_time,
            amount: totalPrice,
            item: JSON.stringify(itemList),
            embed_data: JSON.stringify(embedData),
            description: `Thanh toán đơn hàng ${transactionCode}`,
            bank_code: "",
            callback_url: payment_config_1.ZALO_PAY.callbackUrl,
        };
        const data = [
            payment_config_1.ZALO_PAY.appId,
            transactionCode,
            order.app_user,
            totalPrice,
            app_time,
            order.embed_data,
            order.item,
        ].join("|");
        order.mac = crypto_1.default
            .createHmac("sha256", payment_config_1.ZALO_PAY.key1)
            .update(data)
            .digest("hex");
        const zalopayRes = yield axios_1.default.post(payment_config_1.ZALO_PAY.endpoint, null, {
            params: order,
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
        if (zalopayRes.data.return_code !== 1) {
            return res.status(400).json({
                message: "ZaloPay từ chối giao dịch!",
                error: zalopayRes.data,
            });
        }
        yield payment_model_1.default.create({
            userId: new mongoose_1.Types.ObjectId(userId),
            amount: totalPrice,
            discount_amount: discountAmount,
            status: "pending",
            transaction_code: transactionCode,
            transaction_data: order,
            transaction_summary: {},
            order_info: Object.assign(Object.assign({}, orderInfo), { paymentMethod: "zalopay" }),
            gateway: "zalopay",
        });
        return res.status(200).json({
            paymentUrl: zalopayRes.data.order_url,
            paymentId: transactionCode,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Không tạo được thanh toán ZaloPay",
            error: ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error,
        });
    }
});
exports.createZaloPayPayment = createZaloPayPayment;
// ZaloPay - Callback xử lý thanh toán
const checkZaloPayReturn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data, mac } = req.body;
        const computedMac = crypto_1.default
            .createHmac("sha256", payment_config_1.ZALO_PAY.key2)
            .update(data)
            .digest("hex");
        if (computedMac !== mac) {
            return res.status(400).json({ message: "Chữ ký không hợp lệ!" });
        }
        const result = JSON.parse(data);
        const { app_trans_id, return_code, zp_trans_id, bank_code, discountamount, amount, server_time, } = result;
        const payment = yield payment_model_1.default.findOne({ transaction_code: app_trans_id });
        if (!payment)
            return res.status(404).json({ message: "Không tìm thấy giao dịch!" });
        if (payment.status !== "pending") {
            return res
                .status(200)
                .json({ message: "Giao dịch đã được xử lý trước đó!" });
        }
        if (return_code === 1) {
            payment.status = "success";
        }
        else if (return_code === 2) {
            payment.status = "canceled";
        }
        else {
            payment.status = "failed";
        }
        payment.paid_at = server_time ? new Date(Number(server_time)) : new Date();
        payment.transaction_data = result;
        payment.transaction_summary = {
            gatewayTransactionId: zp_trans_id === null || zp_trans_id === void 0 ? void 0 : zp_trans_id.toString(),
            bankCode: bank_code,
            amount: amount,
        };
        if (discountamount) {
            payment.discount_amount = Number(discountamount);
        }
        yield payment.save();
        const redirect = return_code === 1 ? "fail" : "success";
        return res.redirect(`${payment_config_1.ZALO_PAY.returnUrl.replace("success", redirect)}?orderId=${app_trans_id}`);
    }
    catch (error) {
        return res.status(500).json({ message: "Callback ZaloPay lỗi!", error });
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
            userId: new mongoose_1.Types.ObjectId(userId),
            amount: totalPrice,
            status: "success",
            transaction_code: orderId,
            gateway: "cod",
            transaction_data: {},
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
