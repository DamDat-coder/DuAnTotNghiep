import { Router } from 'express';
import { createVNPayPayment, checkVNPayReturn } from '../controllers/payment.controller';
import { verifyToken } from "../middlewares/auth.middleware";
const router = Router();

router.post('/create-vnpay-payment', verifyToken, createVNPayPayment);
router.get('/check-payment-vnpay', checkVNPayReturn);

export default router;
