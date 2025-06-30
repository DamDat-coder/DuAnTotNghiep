import { Router } from 'express';
import { createVNPayPayment, checkVNPayReturn, createZaloPayPayment,  checkZaloPayReturn} from '../controllers/payment.controller';
import { verifyToken } from "../middlewares/auth.middleware";
const router = Router();

router.post('/create-vnpay-payment', verifyToken, createVNPayPayment);
router.get('/check-payment-vnpay', checkVNPayReturn);
router.post("/create-payment-zalopay", createZaloPayPayment);
router.get("/zalopay-callback", checkZaloPayReturn);
export default router;
