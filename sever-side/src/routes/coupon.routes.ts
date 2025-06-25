import express from 'express';
import {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
} from '../controllers/coupon.controller';
import { verifyToken, verifyAdmin } from "../middlewares/auth.middleware";
const router = express.Router();

router.get('/', getAllCoupons);
router.get('/:id', getCouponById);
router.post('/',  verifyToken, verifyAdmin, createCoupon);
router.put('/:id', verifyToken, verifyAdmin, updateCoupon);
router.delete('/:id', verifyToken, verifyAdmin, deleteCoupon);

export default router;
