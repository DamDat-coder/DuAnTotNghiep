"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Quản lý địa chỉ
router.post("/:id/addresses", user_controller_1.addAddress);
router.put("/:id/addresses/:addressId", user_controller_1.updateAddress);
router.delete("/:id/addresses/:addressId", user_controller_1.deleteAddress);
router.patch("/:id/addresses/:addressId/default", user_controller_1.setDefaultAddress);
// Quản lý người dùng
router.post("/register", user_controller_1.registerUser);
router.post("/login", user_controller_1.loginUser);
router.post("/logout", user_controller_1.logoutUser);
router.post("/refresh-token", user_controller_1.refreshAccessToken);
router.put("/:id", auth_middleware_1.verifyToken, user_controller_1.updateUserInfo);
// Quản lý người dùng (Chỉ dành cho admin)
router.get("/", auth_middleware_1.verifyToken, auth_middleware_1.verifyAdmin, user_controller_1.getAllUsers);
router.get("/:id", auth_middleware_1.verifyToken, auth_middleware_1.verifyAdmin, user_controller_1.getUserById);
router.put("/:id/status", auth_middleware_1.verifyToken, auth_middleware_1.verifyAdmin, user_controller_1.toggleUserStatus);
exports.default = router;
