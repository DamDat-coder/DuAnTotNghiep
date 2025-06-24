import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import verifyToken from "../middlewares/verifyToken";

import {
  createOrder,
  getOrderById,
  getUserOrders,
  getAllOrders,
  updateOrderStatus
} from "../controllers/orderController";

const router = express.Router();

// Security
router.use(helmet());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
router.use(limiter);

// Lấy danh sách đơn của user (user đăng nhập)
router.get("/user/orders", verifyToken, getUserOrders);

// Lấy tất cả đơn hàng (chỉ admin)
router.get("/", verifyToken, /*verifyAdmin,*/ getAllOrders);

// Tạo mới đơn hàng
router.post("/", verifyToken, createOrder);

// Lấy chi tiết đơn hàng theo ID
router.get("/:id", verifyToken, getOrderById);

// Cập nhật đơn hàng (admin)
router.patch("/:id", verifyToken, /*verifyAdmin,*/ updateOrderStatus);

module.exports = router;
