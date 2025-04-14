const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const newsModel = require("../models/newsModel");
const categoryModel = require("../models/categoryModel");

// Đảm bảo thư mục upload tồn tại
const uploadDir = "./public/images";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpg|jpeg|png|gif|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) cb(null, true);
    else cb(new Error("Chỉ được upload file ảnh (jpg, jpeg, png, gif, webp)"));
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Kiểm tra danh mục thuộc nhánh "News"
const isNewsCategory = async (categoryId, newsRootId) => {
  let currentId = categoryId;
  while (currentId) {
    if (currentId.toString() === newsRootId) return true;
    const category = await categoryModel.findById(currentId).lean();
    if (!category) return false;
    currentId = category.parentId;
  }
  return false;
};

// Thêm tin tức
const createNews = [
  upload.single("image"),
  async (req, res) => {
    try {
      const { title, content, category } = req.body;
      if (!title || !content || !category) {
        if (req.file) fs.unlinkSync(req.file.path);
        throw new Error("Tiêu đề, nội dung và danh mục là bắt buộc");
      }

      if (!mongoose.Types.ObjectId.isValid(category)) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: "ID danh mục không hợp lệ" });
      }

      const categoryExists = await categoryModel.findById(category);
      if (!categoryExists) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: "Danh mục không tồn tại" });
      }

      // Kiểm tra danh mục thuộc nhánh "News" (giả định có danh mục News)
      const newsRoot = await categoryModel.findOne({ name: "News", parentId: null }).lean();
      if (!newsRoot) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: "Danh mục gốc News chưa được tạo" });
      }
      const isValidNewsCategory = await isNewsCategory(category, newsRoot._id.toString());
      if (!isValidNewsCategory) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: "Danh mục không thuộc nhánh News" });
      }

      const news = new newsModel({
        title,
        content,
        image: req.file ? `/images/${req.file.filename}` : null,
        author: req.userId,
        category,
      });

      const data = await news.save();
      const populatedNews = await newsModel
        .findById(data._id)
        .populate("author", "name email")
        .populate("category", "name description");

      res.status(201).json({ message: "Tạo tin tức thành công", news: populatedNews });
    } catch (error) {
      if (req.file) fs.unlinkSync(req.file.path);
      res.status(400).json({ message: error.message });
    }
  },
];

// Sửa tin tức
const updateNews = [
  upload.single("image"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, content, category } = req.body;
      const updates = { updatedAt: Date.now() };

      if (title) updates.title = title;
      if (content) updates.content = content;
      if (category) {
        if (!mongoose.Types.ObjectId.isValid(category)) {
          if (req.file) fs.unlinkSync(req.file.path);
          return res.status(400).json({ message: "ID danh mục không hợp lệ" });
        }
        const categoryExists = await categoryModel.findById(category);
        if (!categoryExists) {
          if (req.file) fs.unlinkSync(req.file.path);
          return res.status(400).json({ message: "Danh mục không tồn tại" });
        }
        const newsRoot = await categoryModel.findOne({ name: "News", parentId: null }).lean();
        if (!newsRoot) {
          if (req.file) fs.unlinkSync(req.file.path);
          return res.status(400).json({ message: "Danh mục gốc News chưa được tạo" });
        }
        const isValidNewsCategory = await isNewsCategory(category, newsRoot._id.toString());
        if (!isValidNewsCategory) {
          if (req.file) fs.unlinkSync(req.file.path);
          return res.status(400).json({ message: "Danh mục không thuộc nhánh News" });
        }
        updates.category = category;
      }
      if (req.file) updates.image = `/images/${req.file.filename}`;

      const news = await newsModel.findById(id);
      if (!news) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(404).json({ message: "Không tìm thấy tin tức" });
      }

      // Thành viên chỉ sửa tin tức của chính họ, admin sửa bất kỳ tin tức nào
      if (req.userRole === "member" && news.author.toString() !== req.userId) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(403).json({ message: "Chỉ được sửa tin tức của chính bạn" });
      }

      // Xóa ảnh cũ nếu cập nhật ảnh mới
      if (req.file && news.image) {
        const oldImagePath = path.join(__dirname, "../public", news.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      const updatedNews = await newsModel
        .findByIdAndUpdate(id, { $set: updates }, { new: true })
        .populate("author", "name email")
        .populate("category", "name description");

      res.status(200).json({ message: "Cập nhật tin tức thành công", news: updatedNews });
    } catch (error) {
      if (req.file) fs.unlinkSync(req.file.path);
      res.status(400).json({ message: error.message });
    }
  },
];

// Xóa tin tức
const deleteNews = async (req, res) => {
  try {
    const { id } = req.params;
    const news = await newsModel.findById(id);
    if (!news) {
      return res.status(404).json({ message: "Không tìm thấy tin tức" });
    }

    // Xóa ảnh nếu có
    if (news.image) {
      const imagePath = path.join(__dirname, "../public", news.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await newsModel.findByIdAndDelete(id);
    res.status(200).json({ message: "Xóa tin tức thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh sách tin tức
const getNewsList = async (req, res) => {
  try {
    const { page = 1, limit = 10, category } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (category) {
      if (!mongoose.Types.ObjectId.isValid(category)) {
        return res.status(400).json({ message: "ID danh mục không hợp lệ" });
      }
      const categoryExists = await categoryModel.findById(category);
      if (!categoryExists) {
        return res.status(400).json({ message: "Danh mục không tồn tại" });
      }
      query.category = category;
    }

    const news = await newsModel
      .find(query)
      .populate("author", "name email")
      .populate("category", "name description")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await newsModel.countDocuments(query);

    res.status(200).json({
      news,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      totalNews: total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy chi tiết tin tức
const getNewsDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const news = await newsModel
      .findById(id)
      .populate("author", "name email")
      .populate("category", "name description");
    if (!news) {
      return res.status(404).json({ message: "Không tìm thấy tin tức" });
    }
    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createNews, updateNews, deleteNews, getNewsList, getNewsDetail };