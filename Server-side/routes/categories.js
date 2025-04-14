const express = require("express");
const router = express.Router();
const { verifyToken, restrictTo } = require("../controllers/userController");
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
router.post("/", verifyToken, restrictTo("admin"), createCategory);

// Cập nhật danh mục (chỉ admin)
router.put("/:id", verifyToken, restrictTo("admin"), updateCategory);

// Xóa danh mục (chỉ admin)
router.delete("/:id", verifyToken, restrictTo("admin"), deleteCategory);

module.exports = router;