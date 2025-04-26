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
// Lấy tất cả danh mục
const getAllCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit) || 10, 1);
        const skip = (page - 1) * limit;
        const parentId = req.query.parentId;
        const query = parentId ? { parentId } : { parentId: null };
        const categories = yield categoryModel_1.default
            .find(query)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .populate('parentId', 'name')
            .lean();
        const total = yield categoryModel_1.default.countDocuments(query);
        res.status(200).json({
            status: 'success',
            data: categories,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});
exports.getAllCategories = getAllCategories;
// Lấy chi tiết danh mục
const getCategoryById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({ status: 'error', message: 'ID không hợp lệ' });
            return;
        }
        const category = yield categoryModel_1.default
            .findById(req.params.id)
            .populate('parentId', 'name')
            .lean();
        if (!category) {
            res.status(404).json({ status: 'error', message: 'Không tìm thấy danh mục' });
            return;
        }
        res.status(200).json({ status: 'success', data: category });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});
exports.getCategoryById = getCategoryById;
// Tạo danh mục mới
const createCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, img, parentId } = req.body;
        if (!name || name.length > 100) {
            res.status(400).json({
                status: 'error',
                message: 'Tên danh mục là bắt buộc và tối đa 100 ký tự',
            });
            return;
        }
        if (parentId && !mongoose_1.default.Types.ObjectId.isValid(parentId)) {
            res.status(400).json({ status: 'error', message: 'parentId không hợp lệ' });
            return;
        }
        if (parentId) {
            const parentExists = yield categoryModel_1.default.findById(parentId).lean();
            if (!parentExists) {
                res.status(404).json({ status: 'error', message: 'Danh mục cha không tồn tại' });
                return;
            }
        }
        const newCategory = new categoryModel_1.default({ name, description, img, parentId: parentId || null });
        const savedCategory = yield newCategory.save();
        res.status(201).json({
            status: 'success',
            message: 'Tạo danh mục thành công',
            data: savedCategory,
        });
    }
    catch (error) {
        if (error.code === 11000) {
            res.status(409).json({ status: 'error', message: 'Tên danh mục đã tồn tại' });
            return;
        }
        res.status(500).json({ status: 'error', message: error.message });
    }
});
exports.createCategory = createCategory;
// Cập nhật danh mục
const updateCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const { name, description, img, parentId } = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            res.status(400).json({ status: 'error', message: 'ID không hợp lệ' });
            return;
        }
        if (name && name.length > 100) {
            res.status(400).json({
                status: 'error',
                message: 'Tên danh mục tối đa 100 ký tự',
            });
            return;
        }
        if (parentId && !mongoose_1.default.Types.ObjectId.isValid(parentId)) {
            res.status(400).json({ status: 'error', message: 'parentId không hợp lệ' });
            return;
        }
        if (parentId) {
            const parentExists = yield categoryModel_1.default.findById(parentId).lean();
            if (!parentExists) {
                res.status(404).json({ status: 'error', message: 'Danh mục cha không tồn tại' });
                return;
            }
            if (parentId === id) {
                res.status(400).json({ status: 'error', message: 'Danh mục không thể là cha của chính nó' });
                return;
            }
            const hasCycle = yield checkCycle(id, parentId);
            if (hasCycle) {
                res.status(400).json({ status: 'error', message: 'Phát hiện vòng lặp trong phân cấp' });
                return;
            }
        }
        const updateFields = { updatedAt: Date.now() };
        if (name !== undefined)
            updateFields.name = name;
        if (description !== undefined)
            updateFields.description = description;
        if (img !== undefined)
            updateFields.img = img;
        if (parentId !== undefined)
            updateFields.parentId = parentId || null;
        const updatedCategory = yield categoryModel_1.default.findByIdAndUpdate(id, updateFields, { new: true, runValidators: true });
        if (!updatedCategory) {
            res.status(404).json({ status: 'error', message: 'Không tìm thấy danh mục' });
            return;
        }
        res.status(200).json({
            status: 'success',
            message: 'Cập nhật danh mục thành công',
            data: updatedCategory,
        });
    }
    catch (error) {
        if (error.code === 11000) {
            res.status(409).json({ status: 'error', message: 'Tên danh mục đã tồn tại' });
            return;
        }
        res.status(500).json({ status: 'error', message: error.message });
    }
});
exports.updateCategory = updateCategory;
// Xóa danh mục
const deleteCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            res.status(400).json({ status: 'error', message: 'ID không hợp lệ' });
            return;
        }
        const hasChildren = yield categoryModel_1.default.findOne({ parentId: id }).lean();
        if (hasChildren) {
            res.status(400).json({ status: 'error', message: 'Không thể xóa danh mục có danh mục con' });
            return;
        }
        const newsCount = yield newsModel_1.default.countDocuments({ category: id });
        const productCount = yield productModel_1.default.countDocuments({ category: id });
        if (newsCount > 0 || productCount > 0) {
            res.status(400).json({
                status: 'error',
                message: `Danh mục đang được sử dụng (${newsCount} tin tức, ${productCount} sản phẩm)`,
            });
            return;
        }
        const deletedCategory = yield categoryModel_1.default.findByIdAndDelete(id);
        if (!deletedCategory) {
            res.status(404).json({ status: 'error', message: 'Không tìm thấy danh mục' });
            return;
        }
        res.status(200).json({ status: 'success', message: 'Xóa danh mục thành công' });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});
exports.deleteCategory = deleteCategory;
// Hàm kiểm tra vòng lặp trong phân cấp
const checkCycle = (categoryId, parentId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let currentId = parentId;
    while (currentId) {
        if (currentId.toString() === categoryId)
            return true;
        const category = yield categoryModel_1.default.findById(currentId).lean();
        currentId = ((_a = category === null || category === void 0 ? void 0 : category.parentId) === null || _a === void 0 ? void 0 : _a.toString()) || null;
    }
    return false;
});
