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
const news_model_1 = __importDefault(require("../models/news.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const notification_model_1 = __importDefault(require("../models/notification.model"));
const cloudinary_1 = require("cloudinary");
const upload_middleware_1 = require("../middlewares/upload.middleware");
// Thêm tin tức
const createNews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { title, content, slug, category_id, tags } = req.body;
        const user_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!title || !content || !slug || !category_id || !user_id) {
            res.status(400).json({
                status: "error",
                message: "Thiếu trường bắt buộc: title, content, slug, category_id",
            });
            return;
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(user_id) ||
            !mongoose_1.default.Types.ObjectId.isValid(category_id)) {
            res.status(400).json({
                status: "error",
                message: "user_id hoặc category_id không hợp lệ",
            });
            return;
        }
        const files = (0, upload_middleware_1.normalizeFiles)(req.files);
        const imageUrls = [];
        if (files.length > 0) {
            const uploads = yield Promise.all(files.map((file) => new Promise((resolve, reject) => {
                const stream = cloudinary_1.v2.uploader.upload_stream({ folder: "news" }, (error, result) => {
                    if (error || !result)
                        return reject(error);
                    resolve(result.secure_url);
                });
                stream.end(file.buffer);
            })));
            imageUrls.push(...uploads);
        }
        const newsData = {
            title,
            content,
            slug,
            category_id: new mongoose_1.default.Types.ObjectId(category_id),
            user_id: new mongoose_1.default.Types.ObjectId(user_id),
            tags: tags ? tags.split(",") : [],
            thumbnail: imageUrls[0] || null,
            news_image: imageUrls.slice(1),
            is_published: false,
        };
        const createdNews = new news_model_1.default(newsData);
        const savedNews = yield createdNews.save();
        const populated = yield news_model_1.default
            .findById(savedNews._id)
            .populate("user_id", "name email")
            .populate("category_id", "name");
        // Gửi thông báo cho tất cả user
        setImmediate(() => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const users = yield user_model_1.default.find({}).select("_id").lean();
                const notifications = users.map((user) => ({
                    userId: user._id,
                    title: "Tin tức mới từ Shop4Real!",
                    message: `Tin tức "${savedNews.title}" vừa được đăng, xem ngay nhé!`,
                    type: "news",
                    isRead: false,
                    link: `/posts/${savedNews._id}`,
                }));
                yield notification_model_1.default.insertMany(notifications);
                console.log("Đã gửi thông báo tin tức mới cho người dùng.");
            }
            catch (notifyErr) {
                console.error("Gửi thông báo thất bại:", notifyErr);
            }
        }));
        res.status(201).json({
            status: "success",
            message: "Tạo tin tức thành công",
            data: populated,
        });
    }
    catch (error) {
        if (error.code === 11000) {
            res.status(409).json({ status: "error", message: "Slug đã tồn tại" });
        }
        else {
            res.status(500).json({ status: "error", message: error.message });
        }
    }
});
exports.createNews = createNews;
// Cập nhật tin tức
const updateNews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { title, content, slug, category_id, tags, is_published } = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            res.status(400).json({ status: "error", message: "ID tin tức không hợp lệ" });
            return;
        }
        const existingNews = yield news_model_1.default.findById(id);
        if (!existingNews) {
            res.status(404).json({ status: "error", message: "Tin tức không tồn tại" });
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
            updates.tags = tags.split(",");
        if (typeof is_published === "boolean" ||
            is_published === "true" ||
            is_published === "false") {
            const publishStatus = is_published === true || is_published === "true";
            updates.is_published = publishStatus;
            updates.published_at = publishStatus ? new Date() : null;
        }
        if (category_id && mongoose_1.default.Types.ObjectId.isValid(category_id)) {
            updates.category_id = new mongoose_1.default.Types.ObjectId(category_id);
        }
        const files = (0, upload_middleware_1.normalizeFiles)(req.files);
        if (files.length > 0) {
            const imageUrls = [];
            for (const file of files) {
                const result = yield new Promise((resolve, reject) => {
                    const stream = cloudinary_1.v2.uploader.upload_stream({ folder: "news" }, (error, result) => {
                        if (error || !result)
                            return reject(error);
                        resolve(result.secure_url);
                    });
                    stream.end(file.buffer);
                });
                if (result)
                    imageUrls.push(result);
            }
            updates.thumbnail = imageUrls[0] || null;
            updates.news_image = imageUrls.slice(1);
        }
        const updatedNews = yield news_model_1.default
            .findByIdAndUpdate(id, { $set: updates }, { new: true })
            .populate("user_id", "name email")
            .populate("category_id", "name");
        res.status(200).json({
            status: "success",
            message: "Cập nhật thành công",
            data: updatedNews,
        });
    }
    catch (error) {
        if (error.code === 11000) {
            res.status(409).json({ status: "error", message: "Slug đã tồn tại" });
        }
        else {
            res.status(500).json({ status: "error", message: error.message });
        }
    }
});
exports.updateNews = updateNews;
// Xoá tin tức
const deleteNews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            res.status(400).json({ status: "error", message: "ID tin tức không hợp lệ" });
            return;
        }
        yield news_model_1.default.findByIdAndDelete(id);
        res.status(200).json({ status: "success", message: "Xóa tin tức thành công" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});
exports.deleteNews = deleteNews;
// Lấy danh sách tin tức
const getNewsList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = "1", limit = "10", category_id, isPublished, search, } = req.query;
        const pageNum = Math.max(parseInt(page), 1);
        const limitNum = Math.max(parseInt(limit), 1);
        const skip = (pageNum - 1) * limitNum;
        const query = {};
        if (category_id && mongoose_1.default.Types.ObjectId.isValid(category_id)) {
            query.category_id = category_id;
        }
        if (isPublished !== undefined) {
            query.is_published = isPublished === "true";
        }
        if (search) {
            query.title = { $regex: search, $options: "i" };
        }
        const [news, total] = yield Promise.all([
            news_model_1.default.find(query)
                .populate("user_id", "name email")
                .populate("category_id", "name")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum),
            news_model_1.default.countDocuments(query),
        ]);
        res.status(200).json({
            status: "success",
            data: news,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    }
    catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message || "Lỗi server",
        });
    }
});
exports.getNewsList = getNewsList;
// Lấy chi tiết tin tức
const getNewsDetail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            res.status(400).json({ status: "error", message: "ID tin tức không hợp lệ" });
            return;
        }
        const news = yield news_model_1.default
            .findById(id)
            .populate("user_id", "name email")
            .populate("category_id", "name");
        if (!news) {
            res.status(404).json({ status: "error", message: "Không tìm thấy tin tức" });
            return;
        }
        res.status(200).json({ status: "success", data: news });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});
exports.getNewsDetail = getNewsDetail;
