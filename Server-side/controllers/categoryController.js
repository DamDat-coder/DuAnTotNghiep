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
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategoryById = exports.getAllCategories = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const categoryModel_1 = __importDefault(require("../models/categoryModel"));
const newsModel_1 = __importDefault(require("../models/newsModel"));
const productModel_1 = __importDefault(require("../models/productModel"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
// Lấy danh sách tất cả danh mục (có thể lọc theo parentId)
const getAllCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const parentId = req.query.parentId;
        const query = parentId && mongoose_1.default.Types.ObjectId.isValid(parentId)
            ? { parentId }
            : { parentId: null };
        const categories = yield categoryModel_1.default
            .find(query)
            .sort({ createdAt: -1 })
            .populate("parentId", "name slug")
            .lean();
        const total = yield categoryModel_1.default.countDocuments(query);
        res.status(200).json({
            status: "success",
            data: categories,
            total,
            page,
        });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});
exports.getAllCategories = getAllCategories;
// Lấy thông tin danh mục theo ID
const getCategoryById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            res.status(400).json({ status: "error", message: "ID danh mục không hợp lệ" });
            return;
        }
        const category = yield categoryModel_1.default
            .findById(id)
            .populate("parentId", "name slug")
            .lean();
        if (!category) {
            res.status(404).json({ status: "error", message: "Không tìm thấy danh mục" });
            return;
        }
        res.status(200).json({ status: "success", data: category });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});
exports.getCategoryById = getCategoryById;
// Tạo danh mục mới
const createCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, slug, parentId, image } = req.body;
        if (!name || !slug) {
            res.status(400).json({ status: "error", message: "Tên và slug là bắt buộc" });
            return;
        }
        if (parentId && !mongoose_1.default.Types.ObjectId.isValid(parentId)) {
            res.status(400).json({ status: "error", message: "ID danh mục cha không hợp lệ" });
            return;
        }
        if (parentId) {
            const parentExists = yield categoryModel_1.default.findById(parentId).lean();
            if (!parentExists) {
                res.status(404).json({ status: "error", message: "Danh mục cha không tồn tại" });
                return;
            }
        }
        // Kiểm tra image URL (nếu có)
        if (image && !isValidUrl(image)) {
            res.status(400).json({ status: "error", message: "URL hình ảnh không hợp lệ" });
            return;
        }
        const newCategory = new categoryModel_1.default({
            name,
            slug,
            parentId: parentId || null,
            image: image || null,
        });
        const savedCategory = yield newCategory.save();
        res.status(201).json({
            status: "success",
            message: "Tạo danh mục thành công",
            data: savedCategory,
        });
    }
    catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            res.status(409).json({ status: "error", message: `Danh mục với ${field} đã tồn tại` });
            return;
        }
        res.status(500).json({ status: "error", message: error.message });
    }
});
exports.createCategory = createCategory;
// Cập nhật danh mục
const updateCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const { name, slug, parentId, image } = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            res.status(400).json({ status: "error", message: "ID danh mục không hợp lệ" });
            return;
        }
        if (parentId && parentId !== null && !mongoose_1.default.Types.ObjectId.isValid(parentId)) {
            res.status(400).json({ status: "error", message: "ID danh mục cha không hợp lệ" });
            return;
        }
        if (parentId) {
            const parentExists = yield categoryModel_1.default.findById(parentId).lean();
            if (!parentExists) {
                res.status(404).json({ status: "error", message: "Không tìm thấy danh mục cha" });
                return;
            }
            if (parentId === id) {
                res.status(400).json({ status: "error", message: "Không thể chọn chính nó làm danh mục cha" });
                return;
            }
            const hasCycle = yield checkCycle(id, parentId);
            if (hasCycle) {
                res.status(400).json({ status: "error", message: "Phát hiện vòng lặp trong cây danh mục" });
                return;
            }
        }
        const updateFields = { updatedAt: new Date() };
        if (name !== undefined)
            updateFields.name = name;
        if (slug !== undefined)
            updateFields.slug = slug;
        if (parentId !== undefined)
            updateFields.parentId = parentId || null;
        // Xử lý hình ảnh
        if (image !== undefined) {
            if (image && !isValidUrl(image)) {
                res.status(400).json({ status: "error", message: "URL hình ảnh không hợp lệ" });
                return;
            }
            // Xóa hình ảnh cũ trên Cloudinary nếu có
            if (image) {
                const currentCategory = yield categoryModel_1.default.findById(id).lean();
                if (currentCategory === null || currentCategory === void 0 ? void 0 : currentCategory.image) {
                    const publicId = extractPublicId(currentCategory.image);
                    yield cloudinary_1.default.uploader.destroy(publicId);
                }
            }
            updateFields.image = image || null;
        }
        const updatedCategory = yield categoryModel_1.default.findByIdAndUpdate(id, updateFields, { new: true, runValidators: true });
        if (!updatedCategory) {
            res.status(404).json({ status: "error", message: "Không tìm thấy danh mục để cập nhật" });
            return;
        }
        res.status(200).json({
            status: "success",
            message: "Cập nhật danh mục thành công",
            data: updatedCategory,
        });
    }
    catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            res.status(409).json({ status: "error", message: `Danh mục với ${field} đã tồn tại` });
            return;
        }
        res.status(500).json({ status: "error", message: error.message });
    }
});
exports.updateCategory = updateCategory;
// Xóa danh mục
const deleteCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categoryId = req.params.id;
        if (!mongoose_1.default.Types.ObjectId.isValid(categoryId)) {
            res.status(400).json({ status: "error", message: "ID danh mục không hợp lệ" });
            return;
        }
        const hasChild = yield categoryModel_1.default.findOne({ parentId: categoryId }).lean();
        if (hasChild) {
            res.status(400).json({ status: "error", message: "Không thể xóa danh mục có danh mục con" });
            return;
        }
        const newsCount = yield newsModel_1.default.countDocuments({ category: categoryId });
        const productCount = yield productModel_1.default.countDocuments({ category: categoryId });
        if (newsCount > 0 || productCount > 0) {
            res.status(400).json({
                status: "error",
                message: `Không thể xóa danh mục đang được sử dụng (${newsCount} tin tức, ${productCount} sản phẩm)`
            });
            return;
        }
        // Xóa hình ảnh trên Cloudinary nếu có
        const category = yield categoryModel_1.default.findById(categoryId).lean();
        if (category === null || category === void 0 ? void 0 : category.image) {
            const publicId = extractPublicId(category.image);
            yield cloudinary_1.default.uploader.destroy(publicId);
        }
        const deletedCategory = yield categoryModel_1.default.findByIdAndDelete(categoryId);
        if (!deletedCategory) {
            res.status(404).json({ status: "error", message: "Không tìm thấy danh mục để xóa" });
            return;
        }
        res.status(200).json({ status: "success", message: "Xóa danh mục thành công" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});
exports.deleteCategory = deleteCategory;
// Hàm kiểm tra vòng lặp trong cây danh mục
const checkCycle = (categoryId, parentId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const visited = new Set();
    let currentId = parentId;
    while (currentId && !visited.has(currentId)) {
        if (currentId === categoryId) {
            return true;
        }
        visited.add(currentId);
        const category = yield categoryModel_1.default.findById(currentId).lean();
        currentId = ((_a = category === null || category === void 0 ? void 0 : category.parentId) === null || _a === void 0 ? void 0 : _a.toString()) || null;
    }
    return false;
});
// Hàm kiểm tra URL hợp lệ
const isValidUrl = (url) => {
    try {
        new URL(url);
        return url.startsWith("https://res.cloudinary.com");
    }
    catch (_a) {
        return false;
    }
};
// Hàm trích xuất public_id từ URL Cloudinary
const extractPublicId = (url) => {
    var _a;
    const parts = url.split("/");
    const fileName = (_a = parts.pop()) === null || _a === void 0 ? void 0 : _a.split(".")[0];
    const folder = parts.slice(parts.indexOf("categories"));
    return [...folder, fileName].join("/");
};
