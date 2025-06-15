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
// Get all categories
const getAllCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const parentId = req.query.parentId;
        const query = parentId ? { parentId } : { parentId: null };
        const categories = yield categoryModel_1.default
            .find(query)
            .sort({ createdAt: -1 })
            .populate('parentId', 'name slug')
            .lean();
        const total = yield categoryModel_1.default.countDocuments(query);
        res.status(200).json({
            status: 'success',
            data: categories,
            total,
            page,
        });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});
exports.getAllCategories = getAllCategories;
// Get category by ID
const getCategoryById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({ status: 'error', message: 'Invalid category ID' });
            return;
        }
        const category = yield categoryModel_1.default
            .findById(req.params.id)
            .populate('parentId', 'name slug')
            .lean();
        if (!category) {
            res.status(404).json({ status: 'error', message: 'Category not found' });
            return;
        }
        res.status(200).json({ status: 'success', data: category });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});
exports.getCategoryById = getCategoryById;
// Create a new category
const createCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, slug, parentId, image } = req.body;
        if (!name || !slug) {
            res.status(400).json({ status: 'error', message: 'Name and slug are required' });
            return;
        }
        if (name.length > 100) {
            res.status(400).json({ status: 'error', message: 'Category name must not exceed 100 characters' });
            return;
        }
        if (parentId && !mongoose_1.default.Types.ObjectId.isValid(parentId)) {
            res.status(400).json({ status: 'error', message: 'Invalid parentId' });
            return;
        }
        if (parentId) {
            const parentExists = yield categoryModel_1.default.findById(parentId).lean();
            if (!parentExists) {
                res.status(404).json({ status: 'error', message: 'Parent category not found' });
                return;
            }
        }
        const newCategory = new categoryModel_1.default({ name, slug, parentId: parentId || null, image: image || null });
        const savedCategory = yield newCategory.save();
        res.status(201).json({
            status: 'success',
            message: 'Category created successfully',
            data: savedCategory,
        });
    }
    catch (error) {
        if (error.code === 11000) {
            res.status(409).json({ status: 'error', message: 'Category name or slug already exists' });
            return;
        }
        res.status(500).json({ status: 'error', message: error.message });
    }
});
exports.createCategory = createCategory;
// Update a category
const updateCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const { name, slug, parentId, image } = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            res.status(400).json({ status: 'error', message: 'Invalid category ID' });
            return;
        }
        if (name && name.length > 100) {
            res.status(400).json({ status: 'error', message: 'Category name must not exceed 100 characters' });
            return;
        }
        if (parentId && !mongoose_1.default.Types.ObjectId.isValid(parentId)) {
            res.status(400).json({ status: 'error', message: 'Invalid parentId' });
            return;
        }
        if (parentId) {
            const parentExists = yield categoryModel_1.default.findById(parentId).lean();
            if (!parentExists) {
                res.status(404).json({ status: 'error', message: 'Parent category not found' });
                return;
            }
            if (parentId === id) {
                res.status(400).json({ status: 'error', message: 'Category cannot be its own parent' });
                return;
            }
            const hasCycle = yield checkCycle(id, parentId);
            if (hasCycle) {
                res.status(400).json({ status: 'error', message: 'Detected cycle in category hierarchy' });
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
        if (image !== undefined)
            updateFields.image = image || null;
        const updatedCategory = yield categoryModel_1.default.findByIdAndUpdate(id, updateFields, { new: true, runValidators: true });
        if (!updatedCategory) {
            res.status(404).json({ status: 'error', message: 'Category not found' });
            return;
        }
        res.status(200).json({
            status: 'success',
            message: 'Category updated successfully',
            data: updatedCategory,
        });
    }
    catch (error) {
        if (error.code === 11000) {
            res.status(409).json({ status: 'error', message: 'Category name or slug already exists' });
            return;
        }
        res.status(500).json({ status: 'error', message: error.message });
    }
});
exports.updateCategory = updateCategory;
// Delete a category
const deleteCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            res.status(400).json({ status: 'error', message: 'Invalid category ID' });
            return;
        }
        const hasChildren = yield categoryModel_1.default.findOne({ parentId: id }).lean();
        if (hasChildren) {
            res.status(400).json({ status: 'error', message: 'Cannot delete category with subcategories' });
            return;
        }
        const newsCount = yield newsModel_1.default.countDocuments({ category: id });
        const productCount = yield productModel_1.default.countDocuments({ category: id });
        if (newsCount > 0 || productCount > 0) {
            res.status(400).json({
                status: 'error',
                message: `Category is in use (${newsCount} news, ${productCount} products)`,
            });
            return;
        }
        const deletedCategory = yield categoryModel_1.default.findByIdAndDelete(id);
        if (!deletedCategory) {
            res.status(404).json({ status: 'error', message: 'Category not found' });
            return;
        }
        res.status(200).json({ status: 'success', message: 'Category deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});
exports.deleteCategory = deleteCategory;
// Check for cycles in category hierarchy
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
