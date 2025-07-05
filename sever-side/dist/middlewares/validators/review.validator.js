"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUpdateReviewStatus = exports.validateGetAllReviews = exports.validateCreateReview = void 0;
const express_validator_1 = require("express-validator");
const mongoose_1 = __importDefault(require("mongoose"));
const validateRequest_1 = require("../validateRequest");
// Tạo đánh giá
exports.validateCreateReview = [
    (0, express_validator_1.body)("productId")
        .notEmpty().withMessage("Thiếu productId.")
        .custom((value) => mongoose_1.default.Types.ObjectId.isValid(value)).withMessage("productId không hợp lệ."),
    (0, express_validator_1.body)("content")
        .trim()
        .notEmpty().withMessage("Nội dung đánh giá không được để trống.")
        .isLength({ max: 1000 }).withMessage("Nội dung đánh giá quá dài."),
    (0, express_validator_1.body)("rating")
        .notEmpty().withMessage("Thiếu rating.")
        .isFloat({ min: 1, max: 5 }).withMessage("Rating phải từ 1 đến 5."),
    validateRequest_1.validateRequest,
];
// Lấy tất cả đánh giá
exports.validateGetAllReviews = [
    (0, express_validator_1.query)("page").optional().isInt({ min: 1 }).withMessage("Page phải là số nguyên >= 1."),
    (0, express_validator_1.query)("limit").optional().isInt({ min: 1 }).withMessage("Limit phải là số nguyên >= 1."),
    (0, express_validator_1.query)("status")
        .optional()
        .isIn(["approved", "spam"])
        .withMessage("Status phải là 'approved' hoặc 'spam'."),
    validateRequest_1.validateRequest,
];
// Cập nhật trạng thái review
exports.validateUpdateReviewStatus = [
    (0, express_validator_1.param)("id")
        .custom((value) => mongoose_1.default.Types.ObjectId.isValid(value))
        .withMessage("ID không hợp lệ."),
    (0, express_validator_1.body)("status")
        .notEmpty().withMessage("Thiếu trạng thái.")
        .isIn(["approved", "spam"]).withMessage("Status phải là 'approved' hoặc 'spam'."),
    validateRequest_1.validateRequest,
];
