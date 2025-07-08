"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const user_validator_1 = require("../middlewares/validators/user.validator");
const user_phone_controller_1 = require("../controllers/user.phone.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validateRequest_1 = require("../middlewares/validateRequest");
const router = (0, express_1.Router)();
// Xác thực và quản lý người dùng
router.get("/me", auth_middleware_1.verifyToken, user_controller_1.getCurrentUser);
router.post("/register", user_validator_1.validateRegister, validateRequest_1.validateRequest, user_controller_1.registerUser);
router.post("/login", user_validator_1.validateLogin, validateRequest_1.validateRequest, user_controller_1.loginUser);
router.post("/logout", user_controller_1.logoutUser);
router.post("/refresh-token", user_controller_1.refreshAccessToken);
router.post("/google-login", validateRequest_1.validateRequest, user_controller_1.googleLogin);
// OTP qua SMS
router.post("/send-otp", user_validator_1.validateSendOtp, validateRequest_1.validateRequest, user_phone_controller_1.sendSmsOTP);
router.post("/verify-otp", user_validator_1.validateVerifyOtp, validateRequest_1.validateRequest, user_phone_controller_1.verifySmsOTP);
// Địa chỉ
router.post("/:id/addresses", auth_middleware_1.verifyToken, user_controller_1.addAddress);
router.put("/:id/addresses/:addressId", auth_middleware_1.verifyToken, user_controller_1.updateAddress);
router.delete("/:id/addresses/:addressId", auth_middleware_1.verifyToken, user_controller_1.deleteAddress);
router.patch("/:id/addresses/:addressId/default", auth_middleware_1.verifyToken, user_controller_1.setDefaultAddress);
// Danh sách yêu thích
router.post("/:id/wishlist", auth_middleware_1.verifyToken, user_controller_1.addToWishlist);
router.delete("/:id/wishlist/:productId", auth_middleware_1.verifyToken, user_controller_1.removeFromWishlist);
router.get("/:id/wishlist", auth_middleware_1.verifyToken, user_controller_1.getWishlist);
// Quản lý người dùng (Chỉ admin)
router.get("/", auth_middleware_1.verifyToken, auth_middleware_1.verifyAdmin, user_controller_1.getAllUsers);
router.get("/:id", auth_middleware_1.verifyToken, auth_middleware_1.verifyAdmin, user_controller_1.getUserById);
router.put("/:id", auth_middleware_1.verifyToken, user_controller_1.updateUserInfo);
router.put("/:id/status", auth_middleware_1.verifyToken, auth_middleware_1.verifyAdmin, user_controller_1.toggleUserStatus);
exports.default = router;
