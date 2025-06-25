import { Router } from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  getOrdersByUser,
  updateOrderStatus,
  cancelOrder,
} from "../controllers/order.controller";
import { verifyToken, verifyAdmin } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", verifyToken, createOrder);
router.get("/user/:userId", verifyToken, getOrdersByUser);
router.get("/", verifyToken, verifyAdmin, getOrders);
router.get("/:id", verifyToken, getOrderById);
router.put("/:id/status", verifyToken, verifyAdmin, updateOrderStatus);
router.patch("/:id/cancel", verifyToken, cancelOrder);

export default router;
