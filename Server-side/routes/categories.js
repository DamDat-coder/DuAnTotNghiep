const express = require('express');
const router = express.Router();
const { verifyToken } = require('../controllers/userController');

const { 
    getAllCategories, 
    getCategoryById, 
    createCategory, 
    updateCategory, 
    deleteCategory 
} = require('../controllers/categoryController');

// Lấy tất cả danh mục (không cần auth)
router.get('/', getAllCategories);

// Lấy chi tiết danh mục (không cần auth)
router.get('/:id', getCategoryById);

// Tạo danh mục mới (yêu cầu auth)
router.post('/', verifyToken, createCategory);

// Cập nhật danh mục (yêu cầu auth)
router.put('/:id', verifyToken, updateCategory);

// Xóa danh mục (yêu cầu auth)
router.delete('/:id', verifyToken, deleteCategory);

module.exports = router;