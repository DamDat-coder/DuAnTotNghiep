const express = require("express");
const router = express.Router();
const { verifyToken, verifyAdmin } = require("../controllers/userController");
const { createNews, updateNews, deleteNews, getNewsList, getNewsDetail } = require("../controllers/newsController");

router.post("/", verifyToken, verifyAdmin, createNews); // Chỉ admin tạo tin tức
router.put("/:id", verifyToken, verifyAdmin, updateNews); // Chỉ admin sửa tin tức
router.delete("/:id", verifyToken, verifyAdmin, deleteNews); // Chỉ admin xóa tin tức
router.get("/", getNewsList); // Công khai
router.get("/:id", getNewsDetail); // Công khai

module.exports = router;