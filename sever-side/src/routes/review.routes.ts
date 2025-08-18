import express from "express";
import {
  createReview,
  getProductReviews,
  getAllReviews,
  updateReviewStatus,
  replyToReview, // Thêm hàm mới
} from "../controllers/review.controller";
import { verifyAdmin, verifyToken } from "../middlewares/auth.middleware";
import multer from "multer";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", verifyToken, upload.array("images", 3), createReview);
router.get("/product/:productId", getProductReviews);
router.get("/", verifyToken, verifyAdmin, getAllReviews);
router.put("/:id/status", verifyToken, verifyAdmin, updateReviewStatus);
router.post("/:id/reply", verifyToken, verifyAdmin, replyToReview);

export default router;