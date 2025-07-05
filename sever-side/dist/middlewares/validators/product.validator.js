"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateLockProduct = exports.validateUpdateProduct = exports.validateCreateProduct = void 0;
const express_validator_1 = require("express-validator");
const mongoose_1 = __importDefault(require("mongoose"));
const validateRequest_1 = require("../validateRequest");
// Validate ObjectId
const isValidObjectId = (value) => mongoose_1.default.Types.ObjectId.isValid(value) || "ID không hợp lệ";
// Tạo sản phẩm
exports.validateCreateProduct = [
    (0, express_validator_1.body)("name")
        .trim()
        .notEmpty().withMessage("Tên sản phẩm không được để trống.")
        .isLength({ max: 255 }).withMessage("Tên quá dài (tối đa 255 ký tự)."),
    (0, express_validator_1.body)("description")
        .trim()
        .optional()
        .isLength({ max: 5000 }).withMessage("Mô tả quá dài (tối đa 5000 ký tự)."),
    (0, express_validator_1.body)("category._id")
        .notEmpty().withMessage("Thiếu ID danh mục.")
        .custom(isValidObjectId).withMessage("ID danh mục không hợp lệ."),
    (0, express_validator_1.body)("category.name")
        .notEmpty().withMessage("Thiếu tên danh mục."),
    (0, express_validator_1.body)("variants").isArray({ min: 1 }).withMessage("Phải có ít nhất 1 biến thể."),
    (0, express_validator_1.body)("variants.*.color")
        .notEmpty().withMessage("Mỗi biến thể phải có màu."),
    (0, express_validator_1.body)("variants.*.size")
        .notEmpty().withMessage("Mỗi biến thể phải có size."),
    (0, express_validator_1.body)("variants.*.price")
        .isFloat({ min: 0 }).withMessage("Giá phải lớn hơn hoặc bằng 0."),
    (0, express_validator_1.body)("variants.*.stock")
        .isInt({ min: 0 }).withMessage("Tồn kho phải >= 0."),
    (0, express_validator_1.body)("variants.*.discountPercent")
        .optional()
        .isFloat({ min: 0, max: 100 }).withMessage("Chiết khấu phải từ 0 đến 100%."),
    validateRequest_1.validateRequest,
];
// Cập nhật sản phẩm
exports.validateUpdateProduct = [
    (0, express_validator_1.param)("id").custom(isValidObjectId).withMessage("ID sản phẩm không hợp lệ."),
    ...exports.validateCreateProduct,
];
//  Khóa / mở khóa sản phẩm
exports.validateLockProduct = [
    (0, express_validator_1.param)("id").custom(isValidObjectId).withMessage("ID không hợp lệ."),
    validateRequest_1.validateRequest,
];
