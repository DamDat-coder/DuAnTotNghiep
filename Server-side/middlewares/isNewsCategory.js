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
exports.isNewsCategory = exports.isNewsCategoryMiddleware = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const categoryModel_1 = __importDefault(require("../models/categoryModel"));
const fs_1 = __importDefault(require("fs"));
const isNewsCategoryMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category } = req.body;
        if (!category) {
            res.status(400).json({ message: "Danh mục là bắt buộc" });
            return;
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(category)) {
            if (req.file)
                fs_1.default.unlinkSync(req.file.path);
            res.status(400).json({ message: "ID danh mục không hợp lệ" });
            return;
        }
        const categoryExists = yield categoryModel_1.default.findById(category);
        if (!categoryExists) {
            if (req.file)
                fs_1.default.unlinkSync(req.file.path);
            res.status(400).json({ message: "Danh mục không tồn tại" });
            return;
        }
        const newsRoot = yield categoryModel_1.default.findOne({ name: "News", parentId: null }).lean();
        if (!newsRoot) {
            if (req.file)
                fs_1.default.unlinkSync(req.file.path);
            res.status(400).json({ message: "Danh mục gốc News chưa được tạo" });
            return;
        }
        const isValidNewsCategory = yield isNewsCategory(category, newsRoot._id.toString());
        if (!isValidNewsCategory) {
            if (req.file)
                fs_1.default.unlinkSync(req.file.path);
            res.status(400).json({ message: "Danh mục không thuộc nhánh News" });
            return;
        }
        next();
    }
    catch (error) {
        if (req.file)
            fs_1.default.unlinkSync(req.file.path);
        res.status(400).json({ message: error.message });
    }
});
exports.isNewsCategoryMiddleware = isNewsCategoryMiddleware;
const isNewsCategory = (categoryId, newsRootId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let currentId = categoryId;
    while (currentId) {
        const category = yield categoryModel_1.default.findById(currentId).lean(); // Chuyển đổi thành unknown trước
        if (!category || !category._id)
            return false;
        if (category._id.toString() === newsRootId)
            return true;
        currentId = ((_a = category.parentId) === null || _a === void 0 ? void 0 : _a.toString()) || null;
    }
    return false;
});
exports.isNewsCategory = isNewsCategory;
