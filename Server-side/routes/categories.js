const express = require("express");
const router = express.Router();
const { verifyToken, verifyAdmin } = require("../controllers/userController");
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

// Lấy tất cả danh mục (công khai)
router.get("/", getAllCategories);

// Lấy chi tiết danh mục (công khai)
router.get("/:id", getCategoryById);

// Tạo danh mục mới (chỉ admin)
router.post("/", verifyToken, verifyAdmin, createCategory);

// Cập nhật danh mục (chỉ admin)
router.put("/:id", verifyToken, verifyAdmin, updateCategory);

// Xóa danh mục (chỉ admin)
router.delete("/:id", verifyToken, verifyAdmin, deleteCategory);

module.exports = router;