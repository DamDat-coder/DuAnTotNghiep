import express from "express";
import {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  hideCoupon,
  applyCoupon,
  getTopDiscountCoupons
} from "../controllers/coupon.controller";
import { verifyToken, verifyAdmin } from "../middlewares/auth.middleware";
const router = express.Router();
router.get("/top-discounts", getTopDiscountCoupons);
router.get("/", getAllCoupons);
router.get("/:id", getCouponById);
router.post("/", verifyToken, verifyAdmin, createCoupon);
router.put("/:id", verifyToken, verifyAdmin, updateCoupon);
router.put("/hide/:id", verifyToken, verifyAdmin, hideCoupon);
router.post("/apply", verifyToken, applyCoupon);

export default router;
