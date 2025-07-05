import express from "express";
import {
  createReview,
  getProductReviews,
  getAllReviews,
  updateReviewStatus,
} from "../controllers/review.controller";
import { verifyAdmin, verifyToken } from "../middlewares/auth.middleware";
import multer from "multer";

import {
  validateCreateReview,
  validateGetAllReviews,
  validateUpdateReviewStatus,
} from "../middlewares/validators/review.validator";
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", verifyToken, upload.array("images", 3), validateCreateReview, createReview);
router.get("/product/:productId", getProductReviews);
router.get("/", verifyToken, verifyAdmin, validateGetAllReviews, getAllReviews);
router.put("/:id/status", verifyToken, verifyAdmin, validateUpdateReviewStatus, updateReviewStatus);

export default router;
