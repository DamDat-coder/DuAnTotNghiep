import { body, param } from "express-validator";
import mongoose from "mongoose";
import { validateRequest } from "../validateRequest";

// Validate ObjectId
const isValidObjectId = (value: string) =>
  mongoose.Types.ObjectId.isValid(value) || "ID không hợp lệ";

// Tạo sản phẩm
export const validateCreateProduct = [
  body("name")
    .trim()
    .notEmpty().withMessage("Tên sản phẩm không được để trống.")
    .isLength({ max: 255 }).withMessage("Tên quá dài (tối đa 255 ký tự)."),

  body("description")
    .trim()
    .optional()
    .isLength({ max: 5000 }).withMessage("Mô tả quá dài (tối đa 5000 ký tự)."),

  body("category._id")
    .notEmpty().withMessage("Thiếu ID danh mục.")
    .custom(isValidObjectId).withMessage("ID danh mục không hợp lệ."),

  body("category.name")
    .notEmpty().withMessage("Thiếu tên danh mục."),

  body("variants").isArray({ min: 1 }).withMessage("Phải có ít nhất 1 biến thể."),

  body("variants.*.color")
    .notEmpty().withMessage("Mỗi biến thể phải có màu."),

  body("variants.*.size")
    .notEmpty().withMessage("Mỗi biến thể phải có size."),

  body("variants.*.price")
    .isFloat({ min: 0 }).withMessage("Giá phải lớn hơn hoặc bằng 0."),

  body("variants.*.stock")
    .isInt({ min: 0 }).withMessage("Tồn kho phải >= 0."),

  body("variants.*.discountPercent")
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage("Chiết khấu phải từ 0 đến 100%."),

  validateRequest,
];

// Cập nhật sản phẩm
export const validateUpdateProduct = [
  param("id").custom(isValidObjectId).withMessage("ID sản phẩm không hợp lệ."),
  ...validateCreateProduct,
];

//  Khóa / mở khóa sản phẩm
export const validateLockProduct = [
  param("id").custom(isValidObjectId).withMessage("ID không hợp lệ."),
  validateRequest,
];
