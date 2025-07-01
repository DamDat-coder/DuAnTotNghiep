import express from "express";
import {
  createReview,
  getProductReviews,
  getAllReviews,
  updateReviewStatus,
} from "../controllers/review.controller";
import { verifyAdmin, verifyToken } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/", verifyToken, createReview);
router.get("/product/:productId", getProductReviews);
router.get("/", verifyToken, verifyAdmin, getAllReviews);
router.put("/:id/status", verifyToken, verifyAdmin, updateReviewStatus);

export default router;
