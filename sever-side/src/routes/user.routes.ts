import { Router } from "express";
import {
  getCurrentUser,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  googleLogin,
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getAllUsers,
  getUserById,
  toggleUserStatus,
  updateUserInfo,
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} from "../controllers/user.controller";

import {
  validateRegister,
  validateLogin,
  validateGoogleLogin,
  validateSendOtp,
  validateVerifyOtp,
} from "../middlewares/validators/user.validator";

import {
  sendSmsOTP,
  verifySmsOTP,
} from "../controllers/user.phone.controller";

import {
  verifyToken,
  verifyAdmin,
} from "../middlewares/auth.middleware";

import { validateRequest } from "../middlewares/validateRequest";

const router = Router();

// Xác thực và quản lý người dùng
router.get("/me", verifyToken, getCurrentUser);
router.post("/register", validateRegister, validateRequest, registerUser);
router.post("/login", validateLogin, validateRequest, loginUser);
router.post("/logout", logoutUser);
router.post("/refresh-token", refreshAccessToken);
router.post("/google-login", validateGoogleLogin, validateRequest, googleLogin);

// OTP qua SMS
router.post("/send-otp", validateSendOtp, validateRequest, sendSmsOTP);
router.post("/verify-otp", validateVerifyOtp, validateRequest, verifySmsOTP);

// Địa chỉ
router.post("/:id/addresses", verifyToken, addAddress);
router.put("/:id/addresses/:addressId", verifyToken, updateAddress);
router.delete("/:id/addresses/:addressId", verifyToken, deleteAddress);
router.patch("/:id/addresses/:addressId/default", verifyToken, setDefaultAddress);

// Danh sách yêu thích
router.post("/:id/wishlist", verifyToken, addToWishlist);
router.delete("/:id/wishlist/:productId", verifyToken, removeFromWishlist);
router.get("/:id/wishlist", verifyToken, getWishlist);

// Quản lý người dùng (Chỉ admin)
router.get("/", verifyToken, verifyAdmin, getAllUsers);
router.get("/:id", verifyToken, verifyAdmin, getUserById);
router.put("/:id", verifyToken, updateUserInfo);
router.put("/:id/status", verifyToken, verifyAdmin, toggleUserStatus);

export default router;
