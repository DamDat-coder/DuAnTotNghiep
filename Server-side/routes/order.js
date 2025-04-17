const express = require("express");
const router = express.Router();
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const {
  createOrder,
  getOrderById,
  getUserOrders,
} = require("../controllers/orderController");
const { verifyToken } = require("../controllers/userController");

router.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100, // Giới hạn 100 yêu cầu
});
router.use(limiter);

// Tạo đơn hàng
router.post("/", verifyToken, createOrder);

// Lấy chi tiết đơn hàng theo ID
router.get("/:id", verifyToken, getOrderById);

// Lấy danh sách đơn hàng của người dùng
router.get("/user/orders", verifyToken, getUserOrders);

module.exports = router;