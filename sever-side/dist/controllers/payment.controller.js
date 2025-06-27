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
exports.checkVNPayReturn = exports.createVNPayPayment = void 0;
const vnpay_1 = require("vnpay");
const moment_1 = __importDefault(require("moment"));
const payment_model_1 = __importDefault(require("../models/payment.model"));
const mongoose_1 = require("mongoose");
const vnpay = new vnpay_1.VNPay({
    tmnCode: process.env.VNPAY_TMNCODE,
    secureSecret: process.env.VNPAY_HASH_SECRET,
    vnpayHost: "https://sandbox.vnpayment.vn",
    testMode: true,
    hashAlgorithm: vnpay_1.HashAlgorithm.SHA512,
    loggerFn: () => { }
});
// Tạo URL thanh toán VNPay
const createVNPayPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orderId, totalPrice, userId, orderInfo } = req.body;
        if (!orderId || !totalPrice || !userId || !orderInfo) {
            return res.status(400).json({ message: 'Thiếu orderId, totalPrice, userId hoặc orderInfo!' });
        }
        const paymentData = {
            userId: new mongoose_1.Types.ObjectId(userId),
            amount: totalPrice,
            status: 'pending',
            transaction_code: orderId,
            transaction_data: {},
            paid_at: undefined,
            order_info: orderInfo,
        };
        // Lưu bản ghi thanh toán ban đầu (trạng thái pending)
        const payment = yield payment_model_1.default.create(paymentData);
        const paymentUrl = yield vnpay.buildPaymentUrl({
            vnp_Amount: totalPrice * 100,
            vnp_IpAddr: req.ip || '127.0.0.1',
            vnp_TxnRef: orderId,
            vnp_OrderInfo: `Thanh toán đơn hàng ${orderId}|userId:${userId}`,
            vnp_OrderType: vnpay_1.ProductCode.Other,
            vnp_ReturnUrl: `http://localhost:3000/api/payment/check-payment-vnpay`,
            vnp_Locale: vnpay_1.VnpLocale.VN,
            vnp_CreateDate: Number((0, moment_1.default)().format('YYYYMMDDHHmmss')),
            vnp_ExpireDate: Number((0, moment_1.default)().add(30, 'minutes').format('YYYYMMDDHHmmss')),
        });
        return res.status(200).json({ paymentUrl, paymentId: payment._id });
    }
    catch (error) {
        console.error('VNPay create payment error:', error);
        return res.status(500).json({ message: 'Không tạo được URL thanh toán', error });
    }
});
exports.createVNPayPayment = createVNPayPayment;

// Xử lý callback từ VNPay sau khi thanh toán
const checkVNPayReturn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const queryParams = req.query;
        const isValid = vnpay.verifyReturnUrl(queryParams);
        if (!isValid) {
            return res.status(400).json({ message: 'Chữ ký không hợp lệ!' });
        }
        const { vnp_TxnRef, vnp_ResponseCode, vnp_Amount, vnp_TransactionNo, vnp_BankCode, vnp_PayDate, vnp_OrderInfo } = queryParams;
        // Lấy lại bản ghi payment đã tạo từ createVNPayPayment
        const existingPayment = yield payment_model_1.default.findOne({ transaction_code: vnp_TxnRef });
        if (!existingPayment) {
            return res.status(404).json({ message: 'Không tìm thấy giao dịch để cập nhật!' });
        }
        // Cập nhật trạng thái giao dịch
        existingPayment.status = vnp_ResponseCode === '00' ? 'success' : 'failed';
        existingPayment.transaction_data = queryParams;
        existingPayment.paid_at = vnp_PayDate
            ? (0, moment_1.default)(vnp_PayDate, 'YYYYMMDDHHmmss').toDate()
            : new Date();
        yield existingPayment.save();
        // Redirect về frontend tuỳ theo kết quả thanh toán
        if (vnp_ResponseCode === '00') {
            return res.redirect(`http://localhost:3000/thanh-toan/thanh-cong?orderId=${vnp_TxnRef}`);
        }
        else {
            return res.redirect(`http://localhost:3000/thanh-toan/that-bai?orderId=${vnp_TxnRef}`);
        }
    }
    catch (error) {
        console.error('VNPay return error:', error);
        return res.status(500).json({ message: 'Xử lý callback thất bại!', error });
    }
});
exports.checkVNPayReturn = checkVNPayReturn;
