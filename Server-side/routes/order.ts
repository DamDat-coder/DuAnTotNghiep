import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import {
  createOrder,
  getOrderById,
  getUserOrders,
} from "../controllers/orderController";
import verifyToken from "../middlewares/verifyToken";

const router = express.Router();

router.use(helmet());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
router.use(limiter);

// USER: Xem tất cả đơn của mình
router.get("/user/orders", verifyToken, getUserOrders);
// USER: Tạo đơn mới
router.post("/", verifyToken, createOrder);
// USER: Xem chi tiết đơn của mình
router.get("/:id", verifyToken, getOrderById);
// ------- BỔ SUNG CHO ADMIN --------
import verifyAdmin from '../middlewares/verifyAdmin';
import { 
  getAllOrders, 
  getOrdersByUserId, // Đổi thành getOrdersByUserId cho đồng bộ với controller
  updateOrderStatus  // Đổi thành updateOrderStatus cho đồng bộ với controller
} from '../controllers/orderController';

// ADMIN: Xem tất cả đơn hàng
router.get('/', verifyToken, verifyAdmin, getAllOrders);
// ADMIN: Xem tất cả đơn theo userId bất kỳ
router.get('/user/:userId', verifyToken, verifyAdmin, getOrdersByUserId);
// ADMIN: Cập nhật trạng thái đơn hàng
router.patch('/:id', verifyToken, verifyAdmin, updateOrderStatus);

export default router;