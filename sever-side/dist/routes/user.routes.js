"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const user_phone_controller_1 = require("../controllers/user.phone.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Quản lý địa chỉ
router.post("/:id/addresses", user_controller_1.addAddress);
router.put("/:id/addresses/:addressId", user_controller_1.updateAddress);
router.delete("/:id/addresses/:addressId", user_controller_1.deleteAddress);
router.patch("/:id/addresses/:addressId/default", user_controller_1.setDefaultAddress);
// Quản lý người dùng
router.get("/me", auth_middleware_1.verifyToken, user_controller_1.getCurrentUser);
router.post("/google-login", user_controller_1.googleLogin);
router.post("/send-otp", user_phone_controller_1.sendSmsOTP);
router.post("/verify-otp", user_phone_controller_1.verifySmsOTP);
router.post("/register", user_controller_1.registerUser);
router.post("/login", user_controller_1.loginUser);
router.post("/logout", user_controller_1.logoutUser);
router.post("/refresh-token", user_controller_1.refreshAccessToken);
router.put("/:id", auth_middleware_1.verifyToken, user_controller_1.updateUserInfo);
router.get("/me", auth_middleware_1.verifyToken, user_controller_1.getCurrentUser);
// Quản lý người dùng (Chỉ dành cho admin)
router.get("/", auth_middleware_1.verifyToken, auth_middleware_1.verifyAdmin, user_controller_1.getAllUsers);
router.get("/:id", auth_middleware_1.verifyToken, auth_middleware_1.verifyAdmin, user_controller_1.getUserById);
router.put("/:id/status", auth_middleware_1.verifyToken, auth_middleware_1.verifyAdmin, user_controller_1.toggleUserStatus);
// Quản lý yêu thích
router.post("/:id/wishlist", auth_middleware_1.verifyToken, user_controller_1.addToWishlist);
router.delete("/:id/wishlist/:productId", auth_middleware_1.verifyToken, user_controller_1.removeFromWishlist);
router.get("/:id/wishlist", auth_middleware_1.verifyToken, user_controller_1.getWishlist);
exports.default = router;
