"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNewsDetail = exports.getNewsList = exports.deleteNews = exports.updateNews = exports.createNews = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const newsModel_1 = __importDefault(require("../models/newsModel"));
// Thêm tin tức
const createNews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, content, category } = req.body;
        if (!title || !content) {
            if (req.file)
                fs_1.default.unlinkSync(req.file.path);
            throw new Error("Tiêu đề và nội dung là bắt buộc");
        }
        const news = new newsModel_1.default({
            title,
            content,
            image: req.file ? `/images/${req.file.filename}` : null,
            author: req.userId,
            category,
        });
        const data = yield news.save();
        const populatedNews = yield newsModel_1.default
            .findById(data._id)
            .populate("author", "name email", "users") // Collection name: "users"
            .populate("category", "name description", "categories"); // Collection name: "categories"
        res.status(201).json({ message: "Tạo tin tức thành công", news: populatedNews });
    }
    catch (error) {
        if (req.file)
            fs_1.default.unlinkSync(req.file.path);
        res.status(400).json({ message: error.message });
    }
});
exports.createNews = createNews;
// Sửa tin tức
const updateNews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { title, content, category } = req.body;
        const updates = { updatedAt: Date.now() };
        if (title)
            updates.title = title;
        if (content)
            updates.content = content;
        if (category)
            updates.category = category;
        if (req.file)
            updates.image = `/images/${req.file.filename}`;
        const news = yield newsModel_1.default.findById(id);
        if (!news) {
            if (req.file)
                fs_1.default.unlinkSync(req.file.path);
            res.status(404).json({ message: "Không tìm thấy tin tức" });
            return;
        }
        // Xóa ảnh cũ nếu cập nhật ảnh mới
        if (req.file && news.image) {
            const oldImagePath = path_1.default.join(__dirname, "../public", news.image);
            if (fs_1.default.existsSync(oldImagePath)) {
                fs_1.default.unlinkSync(oldImagePath);
            }
        }
        const updatedNews = yield newsModel_1.default
            .findByIdAndUpdate(id, { $set: updates }, { new: true })
            .populate("author", "name email", "users") // Collection name: "users"
            .populate("category", "name description", "categories"); // Collection name: "categories"
        res.status(200).json({ message: "Cập nhật tin tức thành công", news: updatedNews });
    }
    catch (error) {
        if (req.file)
            fs_1.default.unlinkSync(req.file.path);
        res.status(400).json({ message: error.message });
    }
});
exports.updateNews = updateNews;
// Xóa tin tức
const deleteNews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const news = yield newsModel_1.default.findById(id);
        if (!news) {
            res.status(404).json({ message: "Không tìm thấy tin tức" });
            return;
        }
        // Xóa ảnh nếu có
        if (news.image) {
            const imagePath = path_1.default.join(__dirname, "../public", news.image);
            if (fs_1.default.existsSync(imagePath)) {
                fs_1.default.unlinkSync(imagePath);
            }
        }
        yield newsModel_1.default.findByIdAndDelete(id);
        res.status(200).json({ message: "Xóa tin tức thành công" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.deleteNews = deleteNews;
// Lấy danh sách tin tức
const getNewsList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = "1", limit = "10", category } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const query = {};
        if (category) {
            query.category = category;
        }
        const news = yield newsModel_1.default
            .find(query)
            .populate("author", "name email", "users") // Collection name: "users"
            .populate("category", "name description", "categories") // Collection name: "categories"
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);
        const total = yield newsModel_1.default.countDocuments(query);
        res.status(200).json({
            news,
            currentPage: pageNum,
            totalPages: Math.ceil(total / limitNum),
            totalNews: total,
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getNewsList = getNewsList;
// Lấy chi tiết tin tức
const getNewsDetail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const news = yield newsModel_1.default
            .findById(id)
            .populate("author", "name email", "users") // Collection name: "users"
            .populate("category", "name description", "categories"); // Collection name: "categories"
        if (!news) {
            res.status(404).json({ message: "Không tìm thấy tin tức" });
            return;
        }
        res.status(200).json(news);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getNewsDetail = getNewsDetail;
