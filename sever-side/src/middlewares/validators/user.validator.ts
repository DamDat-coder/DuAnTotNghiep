import { body } from "express-validator";

export const validateRegister = [
  body("email").isEmail().withMessage("Email không hợp lệ."),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Mật khẩu phải có ít nhất 6 ký tự."),
  body("name").notEmpty().withMessage("Tên không được để trống."),
];

export const validateLogin = [
  body("email").isEmail().withMessage("Email không hợp lệ."),
  body("password").notEmpty().withMessage("Vui lòng nhập mật khẩu."),
];
export const validateSendOtp = [  
  body("phone")
    .notEmpty()
    .withMessage("Vui lòng nhập số điện thoại.")
    .isMobilePhone("vi-VN")
    .withMessage("Số điện thoại không hợp lệ."),
];

export const validateVerifyOtp = [  
  body("phone")
    .notEmpty()
    .withMessage("Vui lòng nhập số điện thoại.")
    .isMobilePhone("vi-VN")
    .withMessage("Số điện thoại không hợp lệ."),
  body("otp")
    .notEmpty()
    .withMessage("Vui lòng nhập mã OTP.")
    .isLength({ min: 4, max: 6 })
    .withMessage("OTP không hợp lệ."),
];

export const validateGoogleLogin = [
  body("token").notEmpty().withMessage("Token đăng nhập Google không được để trống."),
];
