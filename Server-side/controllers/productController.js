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
exports.deletePro = exports.editPro = exports.addPro = exports.getProductById = exports.getAllProducts = void 0;
const categoryModel_1 = __importDefault(require("../models/categoryModel"));
const productModel_1 = __importDefault(require("../models/productModel"));
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const uploadDir = path_1.default.join(__dirname, "../public/images");
// GET all products
const getAllProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, idcate, limit, sort, page, gender, discount } = req.query;
    const query = {};
    const options = {};
    if (name)
        query.name = new RegExp(name, "i");
    if (idcate)
        query.categoryId = idcate;
    if (gender)
        query.gender = gender;
    if (discount === "true")
        query.discount = true;
    if (limit)
        options.limit = parseInt(limit) || 10;
    if (sort)
        options.sort = { price: sort === "asc" ? 1 : -1 };
    const pageNum = parseInt(page) || 1;
    options.skip = (pageNum - 1) * (options.limit || 10);
    try {
        const total = yield productModel_1.default.countDocuments(query);
        const arr = yield productModel_1.default
            .find(query, null, options)
            .populate("categoryId", "name")
            .exec();
        if (!arr.length) {
            res.status(404).json({ message: "Không tìm thấy sản phẩm" });
            return;
        }
        res.json({ data: arr, total, page: pageNum, limit: options.limit || 10 });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});
exports.getAllProducts = getAllProducts;
// GET product by ID
const getProductById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield productModel_1.default
            .findById(req.params.id)
            .populate("categoryId", "name")
            .exec();
        if (!product) {
            res.status(404).json({ message: "Sản phẩm không tồn tại" });
            return;
        }
        res.json(product);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});
exports.getProductById = getProductById;
// POST create product
const addPro = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const product = req.body;
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        res.status(400).json({ message: "Vui lòng upload ít nhất một ảnh" });
        return;
    }
    if (!product.name || !product.price || !product.categoryId) {
        res.status(400).json({
            message: "Thiếu thông tin bắt buộc: name, price, hoặc categoryId",
        });
        return;
    }
    product.image = req.files.map((file) => file.filename);
    try {
        const category = yield categoryModel_1.default.findById(product.categoryId);
        if (!category) {
            res.status(404).json({ message: "Danh mục không tồn tại" });
            return;
        }
        const newProduct = new productModel_1.default(product);
        const data = yield newProduct.save();
        res.status(201).json(data);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});
exports.addPro = addPro;
// PUT update product
const editPro = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const product = req.body;
    console.log("editPro - req.body:", req.body); // {}
    console.log("editPro - req.files:", req.files); // Có thể là [] hoặc undefined
    try {
        const existingProduct = yield productModel_1.default.findById(req.params.id);
        if (!existingProduct) {
            res.status(404).json({ message: "Sản phẩm không tồn tại" });
            return;
        }
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            if (existingProduct.image && existingProduct.image.length > 0) {
                yield Promise.all(existingProduct.image.map((img) => promises_1.default.unlink(path_1.default.join(uploadDir, img)).catch(() => { })));
            }
            product.image = req.files.map((file) => file.filename);
        }
        else {
            product.image = existingProduct.image;
        }
        const category = yield categoryModel_1.default.findById(product.categoryId);
        if (!category) {
            res.status(404).json({ message: "Danh mục không tồn tại" });
            return;
        }
        const data = yield productModel_1.default
            .findByIdAndUpdate(req.params.id, { $set: product }, { new: true })
            .exec();
        if (!data) {
            res.status(404).json({ message: "Sản phẩm không tồn tại" });
            return;
        }
        res.json(data);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});
exports.editPro = editPro;
// DELETE product
const deletePro = (req, res) => {
    productModel_1.default.findByIdAndDelete(req.params.id, (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: err.message });
            return;
        }
        if (!data) {
            res.status(404).json({ message: "Sản phẩm không tồn tại" });
            return;
        }
        if (data.image && data.image.length > 0) {
            Promise.all(data.image.map((img) => promises_1.default.unlink(path_1.default.join(uploadDir, img)).catch(() => { }))).then(() => {
                res.json({ message: "Xóa sản phẩm thành công", data });
            });
        }
        else {
            res.json({ message: "Xóa sản phẩm thành công", data });
        }
    });
};
exports.deletePro = deletePro;
