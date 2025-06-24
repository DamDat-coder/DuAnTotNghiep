// routes/coupons.ts

import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon
} from '../controllers/couponController';
import verifyToken from "../middlewares/verifyToken";
import verifyAdmin from "../middlewares/verifyAdmin";

const router = express.Router();

router.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
router.use(limiter);

router.get('/', getAllCoupons);
router.get('/:id', getCouponById);
router.post('/', verifyToken, verifyAdmin, createCoupon);
router.put('/:id', verifyToken, verifyAdmin, updateCoupon);
router.delete('/:id', verifyToken, verifyAdmin, deleteCoupon);

