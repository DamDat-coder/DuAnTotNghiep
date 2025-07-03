import { Router } from 'express';
import { createVNPayPayment, checkVNPayReturn, createZaloPayPayment, checkZaloPayReturn, createMomoPayment, checkMomoReturn } from '../controllers/payment.controller';
import { verifyToken } from "../middlewares/auth.middleware";
const router = Router();

// VNPay
router.post('/create-vnpay-payment', verifyToken, createVNPayPayment);
router.get('/check-payment-vnpay', checkVNPayReturn);

// ZaloPay
router.post("/create-payment-zalopay", createZaloPayPayment);
router.get("/zalopay-callback", checkZaloPayReturn);

// Momo
router.post("/create-momo-payment", createMomoPayment);
router.get("/momo-callback", checkMomoReturn);
export default router;
