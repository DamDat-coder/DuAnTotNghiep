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
const cloudinary_1 = require("cloudinary");
const categoryModel_1 = __importDefault(require("../models/categoryModel"));
const newsModel_1 = __importDefault(require("../models/newsModel"));
const productModel_1 = __importDefault(require("../models/productModel"));
// Lấy tất cả danh mục
const getAllCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parentId = req.query.parentId;
        const query = parentId ? { parentId } : { parentId: null };
        const categories = yield categoryModel_1.default
            .find(query)
            .sort({ createdAt: -1 })
            .populate('parentId', 'name')
            .lean();
        res.status(200).json({
            status: 'success',
            data: categories,
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
        console.log('req.body:', req.body);
        const { name, description, parentId } = req.body;
        if (!name) {
            console.error('Missing name field');
            res.status(400).json({
                status: 'error',
                message: 'Tên danh mục là bắt buộc',
            });
            return;
        }
        if (name.length > 100) {
            console.error('Name too long:', name);
            res.status(400).json({
                status: 'error',
                message: 'Tên danh mục tối đa 100 ký tự',
            });
            return;
        }
        if (parentId && !mongoose_1.default.Types.ObjectId.isValid(parentId)) {
            console.error('Invalid parentId:', parentId);
            res.status(400).json({ status: 'error', message: 'parentId không hợp lệ' });
            return;
        }
        if (parentId) {
            const parentExists = yield categoryModel_1.default.findById(parentId).lean();
            if (!parentExists) {
                console.error('Parent category not found:', parentId);
                res.status(404).json({ status: 'error', message: 'Danh mục cha không tồn tại' });
                return;
            }
        }
        const imageUrl = req.cloudinaryUrl || null;
        const newCategory = new categoryModel_1.default({ name, description, parentId: parentId || null, image: imageUrl });
        const savedCategory = yield newCategory.save();
        res.status(201).json({
            status: 'success',
            message: 'Tạo danh mục thành công',
            data: savedCategory,
        });
    }
    catch (error) {
        console.error('Create category error:', error);
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
        console.log('req.body:', req.body);
        const id = req.params.id;
        const { name, description, parentId } = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            console.error('Invalid category ID:', id);
            res.status(400).json({ status: 'error', message: 'ID không hợp lệ' });
            return;
        }
        if (name && name.length > 100) {
            console.error('Name too long:', name);
            res.status(400).json({
                status: 'error',
                message: 'Tên danh mục tối đa 100 ký tự',
            });
            return;
        }
        if (parentId && !mongoose_1.default.Types.ObjectId.isValid(parentId)) {
            console.error('Invalid parentId:', parentId);
            res.status(400).json({ status: 'error', message: 'parentId không hợp lệ' });
            return;
        }
        if (parentId) {
            const parentExists = yield categoryModel_1.default.findById(parentId).lean();
            if (!parentExists) {
                console.error('Parent category not found:', parentId);
                res.status(404).json({ status: 'error', message: 'Danh mục cha không tồn tại' });
                return;
            }
            if (parentId === id) {
                console.error('Category cannot be its own parent:', id);
                res.status(400).json({ status: 'error', message: 'Danh mục không thể là cha của chính nó' });
                return;
            }
            const hasCycle = yield checkCycle(id, parentId);
            if (hasCycle) {
                console.error('Cycle detected in category hierarchy');
                res.status(400).json({ status: 'error', message: 'Phát hiện vòng lặp trong phân cấp' });
                return;
            }
        }
        const updateFields = { updatedAt: Date.now() };
        if (name !== undefined)
            updateFields.name = name;
        if (description !== undefined)
            updateFields.description = description;
        if (parentId !== undefined)
            updateFields.parentId = parentId || null;
        const cloudinaryUrl = req.cloudinaryUrl;
        if (cloudinaryUrl)
            updateFields.image = cloudinaryUrl;
        const updatedCategory = yield categoryModel_1.default.findByIdAndUpdate(id, updateFields, { new: true, runValidators: true });
        if (!updatedCategory) {
            console.error('Category not found:', id);
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
        console.error('Update category error:', error);
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
    var _a;
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
        // Xóa ảnh trên Cloudinary nếu có
        if (deletedCategory.image) {
            const publicId = (_a = deletedCategory.image.split('/').pop()) === null || _a === void 0 ? void 0 : _a.split('.')[0];
            if (publicId) {
                yield cloudinary_1.v2.uploader.destroy(`categories/${publicId}`);
            }
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
