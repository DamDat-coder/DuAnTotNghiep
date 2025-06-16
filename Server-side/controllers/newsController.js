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
const mongoose_1 = __importDefault(require("mongoose"));
const newsModel_1 = __importDefault(require("../models/newsModel"));
const cloudinaryUpload_1 = require("../utils/cloudinaryUpload");
// Thêm tin tức
const createNews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, content, category_id, slug, tags, thumbnail, news_image, user_id } = req.body;
        if (!title || !content || !category_id || !slug || !user_id) {
            throw new Error("Tiêu đề, nội dung, danh mục, slug và người tạo là bắt buộc");
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(user_id) || !mongoose_1.default.Types.ObjectId.isValid(category_id)) {
            throw new Error("user_id hoặc category_id không hợp lệ");
        }
        const thumbnailResult = thumbnail ? yield (0, cloudinaryUpload_1.uploadImageToCloudinary)(thumbnail) : null;
        const imageList = Array.isArray(news_image) ? news_image : [];
        const uploadedImages = imageList.length > 0 ? yield (0, cloudinaryUpload_1.uploadMultipleImagesToCloudinary)(imageList) : [];
        const news = new newsModel_1.default({
            title,
            content,
            slug,
            thumbnail: (thumbnailResult === null || thumbnailResult === void 0 ? void 0 : thumbnailResult.secure_url) || null,
            user_id,
            category_id,
            tags: tags || [],
            news_image: uploadedImages,
            is_published: false,
        });
        const data = yield news.save();
        const populatedNews = yield newsModel_1.default
            .findById(data._id)
            .populate("user_id", "name email")
            .populate("category_id", "name");
        res.status(201).json({ message: "Tạo tin tức thành công", news: populatedNews });
    }
    catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: "Slug đã tồn tại" });
        }
        else {
            res.status(400).json({ message: error.message });
        }
    }
});
exports.createNews = createNews;
// Cập nhật tin tức
const updateNews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { title, content, category_id, slug, tags, thumbnail, news_image, is_published } = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            res.status(400).json({ message: "ID tin tức không hợp lệ" });
            return;
        }
        const news = yield newsModel_1.default.findById(id);
        if (!news) {
            res.status(404).json({ message: "Không tìm thấy tin tức" });
            return;
        }
        const updates = {};
        if (title)
            updates.title = title;
        if (content)
            updates.content = content;
        if (slug)
            updates.slug = slug;
        if (tags)
            updates.tags = tags;
        if (typeof is_published === "boolean") {
            updates.is_published = is_published;
            updates.published_at = is_published ? new Date() : null;
        }
        if (category_id) {
            if (!mongoose_1.default.Types.ObjectId.isValid(category_id)) {
                throw new Error("category_id không hợp lệ");
            }
            updates.category_id = new mongoose_1.default.Types.ObjectId(category_id);
        }
        if (thumbnail) {
            if (news.thumbnail)
                yield (0, cloudinaryUpload_1.deleteImageFromCloudinary)(news.thumbnail);
            const thumbnailResult = yield (0, cloudinaryUpload_1.uploadImageToCloudinary)(thumbnail);
            updates.thumbnail = thumbnailResult.secure_url;
        }
        if (Array.isArray(news_image) && news_image.length > 0) {
            for (const img of news.news_image || []) {
                yield (0, cloudinaryUpload_1.deleteImageFromCloudinary)(img);
            }
            const uploadedImages = yield (0, cloudinaryUpload_1.uploadMultipleImagesToCloudinary)(news_image);
            updates.news_image = uploadedImages;
        }
        const updatedNews = yield newsModel_1.default
            .findByIdAndUpdate(id, { $set: updates }, { new: true })
            .populate("user_id", "name email")
            .populate("category_id", "name");
        res.status(200).json({ message: "Cập nhật tin tức thành công", news: updatedNews });
    }
    catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: "Slug đã tồn tại" });
        }
        else {
            res.status(400).json({ message: error.message });
        }
    }
});
exports.updateNews = updateNews;
// Xoá tin tức
const deleteNews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            res.status(400).json({ message: "ID tin tức không hợp lệ" });
            return;
        }
        const news = yield newsModel_1.default.findById(id);
        if (!news) {
            res.status(404).json({ message: "Không tìm thấy tin tức" });
            return;
        }
        if (news.thumbnail)
            yield (0, cloudinaryUpload_1.deleteImageFromCloudinary)(news.thumbnail);
        for (const img of news.news_image || []) {
            yield (0, cloudinaryUpload_1.deleteImageFromCloudinary)(img);
        }
        yield newsModel_1.default.findByIdAndDelete(id);
        res.status(200).json({ message: "Xoá tin tức thành công" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.deleteNews = deleteNews;
// Lấy danh sách tin tức
const getNewsList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = "1", limit = "10", category_id } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const query = {};
        if (category_id) {
            if (!mongoose_1.default.Types.ObjectId.isValid(category_id)) {
                throw new Error("category_id không hợp lệ");
            }
            query.category_id = category_id;
        }
        const news = yield newsModel_1.default
            .find(query)
            .populate("user_id", "name email")
            .populate("category_id", "name")
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
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            res.status(400).json({ message: "ID tin tức không hợp lệ" });
            return;
        }
        const news = yield newsModel_1.default
            .findById(id)
            .populate("user_id", "name email")
            .populate("category_id", "name");
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
