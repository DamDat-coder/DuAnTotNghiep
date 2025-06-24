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
exports.deleteCategory = exports.updateCategory = exports.getCategoryTree = exports.createCategory = void 0;
const category_model_1 = __importDefault(require("../models/category.model"));
const slugify_1 = __importDefault(require("slugify"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
// Tạo danh mục mới
const createCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, parentId } = req.body;
        if (!name)
            return res.status(400).json({ success: false, message: "Tên danh mục là bắt buộc." });
        const slug = (0, slugify_1.default)(name, { lower: true });
        const exists = yield category_model_1.default.findOne({ slug });
        if (exists)
            return res.status(409).json({ success: false, message: "Slug đã tồn tại." });
        let imageUrl = null;
        if (req.file) {
            const result = yield new Promise((resolve, reject) => {
                const uploadStream = cloudinary_1.default.uploader.upload_stream({ folder: "categories" }, (err, result) => {
                    if (err || !result)
                        reject(err);
                    else
                        resolve(result);
                });
                uploadStream.end(req.file.buffer);
            });
            imageUrl = result.secure_url;
        }
        const newCategory = yield category_model_1.default.create({
            name,
            slug,
            parentId: parentId || null,
            image: imageUrl,
        });
        res.status(201).json({ success: true, message: "Tạo danh mục thành công.", data: newCategory });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi khi tạo danh mục." });
    }
});
exports.createCategory = createCategory;
// Lấy danh sách cây danh mục
const getCategoryTree = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield category_model_1.default.find().lean();
        const buildTree = (parentId = null) => {
            return categories
                .filter((cat) => {
                const catParentId = cat.parentId ? cat.parentId.toString() : null;
                return catParentId === parentId;
            })
                .map((cat) => (Object.assign(Object.assign({}, cat), { children: buildTree(cat._id.toString()) })));
        };
        const tree = buildTree();
        res.status(200).json({ success: true, data: tree });
    }
    catch (error) {
        console.error("Lỗi khi lấy cây danh mục:", error);
        res.status(500).json({ success: false, message: "Lỗi khi lấy cây danh mục." });
    }
});
exports.getCategoryTree = getCategoryTree;
// Cập nhật danh mục
const updateCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, parentId } = req.body;
        const updateData = {};
        if (name) {
            updateData.name = name;
            updateData.slug = (0, slugify_1.default)(name, { lower: true });
        }
        if (parentId !== undefined)
            updateData.parentId = parentId || null;
        if (req.file) {
            const result = yield new Promise((resolve, reject) => {
                const uploadStream = cloudinary_1.default.uploader.upload_stream({ folder: "categories" }, (err, result) => {
                    if (err || !result)
                        reject(err);
                    else
                        resolve(result);
                });
                uploadStream.end(req.file.buffer);
            });
            updateData.image = result.secure_url;
        }
        const updated = yield category_model_1.default.findByIdAndUpdate(id, updateData, { new: true });
        if (!updated)
            return res.status(404).json({ success: false, message: "Không tìm thấy danh mục." });
        res.status(200).json({ success: true, message: "Cập nhật danh mục thành công.", data: updated });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi khi cập nhật danh mục." });
    }
});
exports.updateCategory = updateCategory;
// Xoá danh mục
const deleteCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const hasChildren = yield category_model_1.default.findOne({ parentId: id });
        if (hasChildren)
            return res.status(400).json({ success: false, message: "Không thể xoá vì có danh mục con." });
        const deleted = yield category_model_1.default.findByIdAndDelete(id);
        if (!deleted)
            return res.status(404).json({ success: false, message: "Không tìm thấy danh mục." });
        res.status(200).json({ success: true, message: "Xoá danh mục thành công." });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi khi xoá danh mục." });
    }
});
exports.deleteCategory = deleteCategory;
