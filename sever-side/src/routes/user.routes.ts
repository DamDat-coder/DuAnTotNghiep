import { Router } from "express";
import {
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
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
  getWishlist
} from "../controllers/user.controller";
import { verifyToken, verifyAdmin } from "../middlewares/auth.middleware";

const router = Router();

// Quản lý địa chỉ
router.post("/:id/addresses", addAddress);
router.put("/:id/addresses/:addressId", updateAddress);
router.delete("/:id/addresses/:addressId", deleteAddress);
router.patch("/:id/addresses/:addressId/default", setDefaultAddress);

// Quản lý người dùng
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/refresh-token", refreshAccessToken);
router.put("/:id", verifyToken, updateUserInfo);

// Quản lý người dùng (Chỉ dành cho admin)
router.get("/", verifyToken, verifyAdmin, getAllUsers);
router.get("/:id", verifyToken, verifyAdmin, getUserById);
router.put("/:id/status", verifyToken, verifyAdmin, toggleUserStatus);

// Quản lý yêu thích
router.post("/:id/wishlist", verifyToken, addToWishlist);
router.delete("/:id/wishlist/:productId", verifyToken, removeFromWishlist);
router.get("/:id/wishlist", verifyToken, getWishlist);
export default router;
