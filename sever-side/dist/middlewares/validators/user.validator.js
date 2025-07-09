"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateVerifyOtp = exports.validateSendOtp = exports.validateLogin = exports.validateRegister = void 0;
const express_validator_1 = require("express-validator");
exports.validateRegister = [
    (0, express_validator_1.body)("email").isEmail().withMessage("Email không hợp lệ."),
    (0, express_validator_1.body)("password")
        .isLength({ min: 6 })
        .withMessage("Mật khẩu phải có ít nhất 6 ký tự."),
    (0, express_validator_1.body)("name").notEmpty().withMessage("Tên không được để trống."),
];
exports.validateLogin = [
    (0, express_validator_1.body)("email").isEmail().withMessage("Email không hợp lệ."),
    (0, express_validator_1.body)("password").notEmpty().withMessage("Vui lòng nhập mật khẩu."),
];
exports.validateSendOtp = [
    (0, express_validator_1.body)("phone")
        .notEmpty()
        .withMessage("Vui lòng nhập số điện thoại.")
        .isMobilePhone("vi-VN")
        .withMessage("Số điện thoại không hợp lệ."),
];
exports.validateVerifyOtp = [
    (0, express_validator_1.body)("phone")
        .notEmpty()
        .withMessage("Vui lòng nhập số điện thoại.")
        .isMobilePhone("vi-VN")
        .withMessage("Số điện thoại không hợp lệ."),
    (0, express_validator_1.body)("otp")
        .notEmpty()
        .withMessage("Vui lòng nhập mã OTP.")
        .isLength({ min: 4, max: 6 })
        .withMessage("OTP không hợp lệ."),
];
