import { body, param, query } from "express-validator";
import mongoose from "mongoose";
import { validateRequest } from "../validateRequest";

// Tạo đánh giá
export const validateCreateReview = [
  body("productId")
    .notEmpty().withMessage("Thiếu productId.")
    .custom((value) => mongoose.Types.ObjectId.isValid(value)).withMessage("productId không hợp lệ."),
  body("content")
    .trim()
    .notEmpty().withMessage("Nội dung đánh giá không được để trống.")
    .isLength({ max: 1000 }).withMessage("Nội dung đánh giá quá dài."),
  body("rating")
    .notEmpty().withMessage("Thiếu rating.")
    .isFloat({ min: 1, max: 5 }).withMessage("Rating phải từ 1 đến 5."),
  validateRequest,
];

// Lấy tất cả đánh giá
export const validateGetAllReviews = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page phải là số nguyên >= 1."),
  query("limit").optional().isInt({ min: 1 }).withMessage("Limit phải là số nguyên >= 1."),
  query("status")
    .optional()
    .isIn(["approved", "spam"])
    .withMessage("Status phải là 'approved' hoặc 'spam'."),
  validateRequest,
];

// Cập nhật trạng thái review
export const validateUpdateReviewStatus = [
  param("id")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("ID không hợp lệ."),
  body("status")
    .notEmpty().withMessage("Thiếu trạng thái.")
    .isIn(["approved", "spam"]).withMessage("Status phải là 'approved' hoặc 'spam'."),
  validateRequest,
];
