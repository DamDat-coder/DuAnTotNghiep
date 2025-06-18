"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categoryController_1 = require("../controllers/categoryController");
const verifyToken_1 = __importDefault(require("../middlewares/verifyToken"));
const verifyAdmin_1 = __importDefault(require("../middlewares/verifyAdmin"));
const router = (0, express_1.Router)();
router.get("/all/flat", categoryController_1.getAllCategoriesFlat); // Tất cả (phẳng)
router.get("/parents", categoryController_1.getParentCategories); // Danh mục cha
router.get("/children/:parentId", categoryController_1.getChildCategories); // Danh mục con
router.get("/", categoryController_1.getAllCategories); // Cha hoặc con theo ?parentId=xxx
router.get("/:id", categoryController_1.getCategoryById);
router.post("/", verifyToken_1.default, verifyAdmin_1.default, categoryController_1.createCategory);
router.put("/:id", verifyToken_1.default, verifyAdmin_1.default, categoryController_1.updateCategory);
router.delete("/:id", verifyToken_1.default, verifyAdmin_1.default, categoryController_1.deleteCategory);
module.exports = router;
