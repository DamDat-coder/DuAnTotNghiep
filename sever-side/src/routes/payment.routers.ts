import { Router } from "express";
import {
  createVNPayPayment,
  checkVNPayReturn,
  createZaloPayPayment,
  checkZaloPayReturn,
  createCodPayment,
} from "../controllers/payment.controller";
import { verifyToken } from "../middlewares/auth.middleware";
const router = Router();

// VNPay
router.post("/create-vnpay-payment", verifyToken, createVNPayPayment);
router.get("/check-payment-vnpay", checkVNPayReturn);

// ZaloPay
router.post("/create-payment-zalopay", createZaloPayPayment);
router.get("/check-payment-zalopay", checkZaloPayReturn);

// Cod
router.post("/create-cod-payment", verifyToken, createCodPayment);
export default router;
