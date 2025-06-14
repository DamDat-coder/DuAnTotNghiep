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
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
// lấy tất cả sản phẩm
const getAllProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, idcate, limit, sort, page } = req.query;
    const query = {};
    const options = {};
    if (name)
        query.name = new RegExp(name, "i");
    if (idcate)
        query["category._id"] = idcate;
    if (limit)
        options.limit = parseInt(limit) || 10;
    if (sort) {
        options.sort = { "variants.price": sort === "asc" ? 1 : -1 };
    }
    const pageNum = parseInt(page) || 1;
    options.skip = (pageNum - 1) * (options.limit || 10);
    try {
        const total = yield productModel_1.default.countDocuments(query);
        const arr = yield productModel_1.default
            .find(query, null, options)
            .populate("category._id", "name")
            .exec();
        if (!arr.length) {
            res.status(404).json({ message: "Không tìm thấy sản phẩm" });
            return;
        }
        const result = arr.map((product) => (Object.assign(Object.assign({}, product.toObject()), { category: {
                _id: product.category._id,
                name: product.category.name,
            } })));
        res.json({ data: result, total, page: pageNum, limit: options.limit || 10 });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});
exports.getAllProducts = getAllProducts;
// lấy sản phẩm theo id
const getProductById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield productModel_1.default
            .findById(req.params.id)
            .populate("category._id", "name")
            .exec();
        if (!product) {
            res.status(404).json({ message: "Sản phẩm không tồn tại" });
            return;
        }
        const result = Object.assign(Object.assign({}, product.toObject()), { category: {
                _id: product.category._id,
                name: product.category.name,
            } });
        res.json(result);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});
exports.getProductById = getProductById;
const addPro = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const product = req.body;
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        res.status(400).json({ message: "Vui lòng upload ít nhất một ảnh" });
        return;
    }
    if (!product.name ||
        !product.category ||
        !product.category._id ||
        !product.variants ||
        !Array.isArray(product.variants) ||
        product.variants.length === 0) {
        res.status(400).json({
            message: "Thiếu thông tin bắt buộc: name, category._id, hoặc variants",
        });
        return;
    }
    // Validate variants
    const validColors = ["Đen", "Trắng", "Xám", "Đỏ"];
    const validSizes = ["S", "M", "L", "XL"];
    for (const variant of product.variants) {
        if (!variant.price ||
            !variant.color ||
            !variant.size ||
            !validColors.includes(variant.color) ||
            !validSizes.includes(variant.size) ||
            variant.stock === undefined ||
            variant.discountPercent === undefined) {
            res.status(400).json({ message: "Thông tin variant không hợp lệ" });
            return;
        }
    }
    try {
        // ✅ SỬA: Bọc upload_stream thành Promise
        const uploadPromises = req.files.map((file) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary_1.default.uploader.upload_stream({ resource_type: "image", folder: "products" }, (error, result) => {
                    if (error || !result)
                        return reject(error);
                    resolve(result);
                });
                stream.end(file.buffer);
            });
        });
        const uploadResults = yield Promise.all(uploadPromises);
        product.image = uploadResults.map((result) => result.secure_url);
        // Validate category
        const category = yield categoryModel_1.default.findById(product.category._id);
        if (!category) {
            res.status(404).json({ message: "Danh mục không tồn tại" });
            return;
        }
        product.category.name = category.name;
        // Save product
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
// update sản phẩm
const editPro = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const product = req.body;
    try {
        const existingProduct = yield productModel_1.default.findById(req.params.id);
        if (!existingProduct) {
            res.status(404).json({ message: "Sản phẩm không tồn tại" });
            return;
        }
        // update hình
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            // xóa hình khỏi Cloudinary
            if (existingProduct.image && existingProduct.image.length > 0) {
                const deletePromises = existingProduct.image.map((img) => {
                    var _a;
                    const publicId = (_a = img.split("/").pop()) === null || _a === void 0 ? void 0 : _a.split(".")[0]; // Extract public_id from URL
                    if (publicId) {
                        return cloudinary_1.default.uploader.destroy(`products/${publicId}`).catch(() => { });
                    }
                    return Promise.resolve();
                });
                yield Promise.all(deletePromises);
            }
            // up hình cloudinary
            const uploadPromises = req.files.map((file) => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary_1.default.uploader.upload_stream({ resource_type: "image", folder: "products" }, (error, result) => {
                        if (error || !result)
                            return reject(error);
                        resolve(result);
                    });
                    stream.end(file.buffer);
                });
            });
            const uploadResults = yield Promise.all(uploadPromises);
            product.image = uploadResults.map((result) => result.secure_url);
        }
        else {
            product.image = existingProduct.image;
        }
        if (product.category && product.category._id) {
            const category = yield categoryModel_1.default.findById(product.category._id);
            if (!category) {
                res.status(404).json({ message: "Danh mục không tồn tại" });
                return;
            }
            product.category.name = category.name;
        }
        else {
            product.category = existingProduct.category;
        }
        if (product.variants && Array.isArray(product.variants)) {
            const validColors = ["Đen", "Trắng", "Xám", "Đỏ"];
            const validSizes = ["S", "M", "L", "XL"];
            for (const variant of product.variants) {
                if (!variant.price ||
                    !variant.color ||
                    !variant.size ||
                    !validColors.includes(variant.color) ||
                    !validSizes.includes(variant.size) ||
                    variant.stock === undefined ||
                    variant.discountPercent === undefined) {
                    res.status(400).json({ message: "Thông tin variant không hợp lệ" });
                    return;
                }
            }
        }
        // Update product
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
const deletePro = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield productModel_1.default.findByIdAndDelete(req.params.id).exec();
        if (!data) {
            res.status(404).json({ message: "Sản phẩm không tồn tại" });
            return;
        }
        // xóa hìnhhình
        if (data.image && data.image.length > 0) {
            const deletePromises = data.image.map((img) => {
                var _a;
                const publicId = (_a = img.split("/").pop()) === null || _a === void 0 ? void 0 : _a.split(".")[0];
                if (publicId) {
                    return cloudinary_1.default.uploader.destroy(`products/${publicId}`).catch(() => { });
                }
                return Promise.resolve();
            });
            yield Promise.all(deletePromises);
        }
        res.json({ message: "Xóa sản phẩm thành công", data });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});
exports.deletePro = deletePro;
