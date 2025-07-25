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
  forgotPassword,
  resetPassword,
  updatePassword,
} from "../controllers/user.controller";

import { sendSmsOTP, verifySmsOTP } from "../controllers/user.phone.controller";

import { verifyToken, verifyAdmin } from "../middlewares/auth.middleware";

const router = Router();

// Xác thực và quản lý người dùng
router.get("/me", verifyToken, getCurrentUser);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/refresh-token", refreshAccessToken);
router.post("/google-login", googleLogin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/update-password", verifyToken, updatePassword);

// OTP qua SMS
router.post("/send-otp", sendSmsOTP);
router.post("/verify-otp", verifySmsOTP);

// Địa chỉ
router.post("/:id/addresses", verifyToken, addAddress);
router.put("/:id/addresses/:addressId", verifyToken, updateAddress);
router.delete("/:id/addresses/:addressId", verifyToken, deleteAddress);
router.patch(
  "/:id/addresses/:addressId/default",
  verifyToken,
  setDefaultAddress
);

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
