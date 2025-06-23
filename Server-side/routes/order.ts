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

router.get("/user/orders", verifyToken, getUserOrders);
router.post("/", verifyToken, createOrder);
router.get("/:id", verifyToken, getOrderById);

module.exports = router;
