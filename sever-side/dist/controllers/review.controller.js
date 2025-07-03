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
exports.updateReviewStatus = exports.getAllReviews = exports.getProductReviews = exports.createReview = void 0;
const review_model_1 = __importDefault(require("../models/review.model"));
const order_model_1 = __importDefault(require("../models/order.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const SPAM_KEYWORDS = ["xxx", "lừa đảo", "quảng cáo", "viagra", "hack", "free tiền"];
const createReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { productId, content, rating } = req.body;
        if (!userId || !productId || !content || !rating) {
            return res.status(400).json({ success: false, message: "Thiếu thông tin review." });
        }
        const order = yield order_model_1.default.findOne({
            userId: userId,
            status: "delivered",
            "items.productId": new mongoose_1.default.Types.ObjectId(productId),
        });
        if (!order) {
            return res.status(403).json({
                success: false,
                message: "Bạn chỉ có thể đánh giá khi đã mua và nhận hàng sản phẩm này.",
            });
        }
        const existingReview = yield review_model_1.default.findOne({ userId, productId });
        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: "Bạn đã đánh giá sản phẩm này rồi.",
            });
        }
        let isSpam = false;
        for (const keyword of SPAM_KEYWORDS) {
            if (content.toLowerCase().includes(keyword.toLowerCase())) {
                isSpam = true;
                break;
            }
        }
        let status = "approved";
        let warning = "";
        if (isSpam) {
            status = "spam";
            // Đếm số review đã bị spam trước đó
            const spamCount = yield review_model_1.default.countDocuments({
                userId,
                status: "spam",
            });
            const totalSpam = spamCount + 1; // tính cả review hiện tại
            if (totalSpam === 2) {
                warning = "⚠️ Bạn đã bị đánh dấu spam 2 lần. Nếu tiếp tục, tài khoản sẽ bị khóa.";
            }
            else if (totalSpam >= 3) {
                yield user_model_1.default.findByIdAndUpdate(userId, { is_active: false });
                warning = "🚫 Tài khoản đã bị khóa vì spam quá nhiều.";
            }
        }
        const review = yield review_model_1.default.create({
            userId,
            productId,
            content,
            rating,
            status,
        });
        return res.status(201).json(Object.assign({ success: true, message: "Đã gửi đánh giá.", data: review }, (warning && { warning })));
    }
    catch (error) {
        console.error("Lỗi tạo review:", error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ." });
    }
});
exports.createReview = createReview;
const getProductReviews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productId = req.params.productId;
        const reviews = yield review_model_1.default.find({
            productId,
            status: "approved",
        })
            .populate("userId", "name")
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: reviews });
    }
    catch (error) {
        console.error("Lỗi khi lấy đánh giá:", error);
        res.status(500).json({ success: false, message: "Lỗi máy chủ." });
    }
});
exports.getProductReviews = getProductReviews;
const getAllReviews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reviews = yield review_model_1.default.find()
            .populate("userId", "name email")
            .populate("productId", "name");
        res.status(200).json({ success: true, data: reviews });
    }
    catch (error) {
        console.error("Lỗi khi lấy tất cả đánh giá:", error);
        res.status(500).json({ success: false, message: "Lỗi máy chủ." });
    }
});
exports.getAllReviews = getAllReviews;
const updateReviewStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!["approved", "spam"].includes(status)) {
            return res.status(400).json({ success: false, message: "Trạng thái không hợp lệ." });
        }
        const updated = yield review_model_1.default.findByIdAndUpdate(id, { status }, { new: true });
        if (!updated) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đánh giá." });
        }
        res.status(200).json({ success: true, message: "Cập nhật trạng thái thành công.", data: updated });
    }
    catch (error) {
        console.error("Lỗi khi cập nhật trạng thái đánh giá:", error);
        res.status(500).json({ success: false, message: "Lỗi máy chủ." });
    }
});
exports.updateReviewStatus = updateReviewStatus;
