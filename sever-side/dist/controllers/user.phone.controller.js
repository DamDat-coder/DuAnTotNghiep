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
exports.verifySmsOTP = exports.sendSmsOTP = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const server_sdk_1 = require("@vonage/server-sdk");
const auth_1 = require("@vonage/auth");
const credentials = new auth_1.Auth({
    apiKey: process.env.VONAGE_API_KEY,
    apiSecret: process.env.VONAGE_API_SECRET,
});
const vonage = new server_sdk_1.Vonage(credentials);
const otpMap = new Map();
// Gửi OTP
const sendSmsOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { phone } = req.body;
        if (!phone) {
            return res.status(400).json({ success: false, message: "Vui lòng nhập số điện thoại." });
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otpMap.set(phone, otp);
        console.log(`📩 Gửi OTP ${otp} đến số: ${phone}`);
        yield vonage.sms.send({
            to: phone,
            from: process.env.VONAGE_FROM || "Shop4Real",
            text: `Mã OTP Shop4Real của bạn là: ${otp}`,
        });
        return res.json({ success: true, message: "Đã gửi OTP qua SMS." });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Gửi SMS OTP thất bại.",
            error: error.message || "Lỗi không xác định.",
        });
    }
});
exports.sendSmsOTP = sendSmsOTP;
// Xác minh OTP
const verifySmsOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { phone, otp } = req.body;
        if (!phone || !otp) {
            return res.status(400).json({ success: false, message: "Thiếu số điện thoại hoặc mã OTP." });
        }
        const savedOTP = otpMap.get(phone);
        if (!savedOTP) {
            return res.status(400).json({ success: false, message: "OTP không tồn tại hoặc đã hết hạn." });
        }
        if (otp !== savedOTP) {
            return res.status(401).json({ success: false, message: "Mã OTP không chính xác." });
        }
        otpMap.delete(phone);
        return res.json({ success: true, message: "Xác minh OTP thành công." });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Lỗi xác minh OTP.",
            error: error.message || "Lỗi không xác định.",
        });
    }
});
exports.verifySmsOTP = verifySmsOTP;
