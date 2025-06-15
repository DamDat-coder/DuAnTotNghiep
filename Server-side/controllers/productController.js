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
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getAllProducts = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const productModel_1 = __importDefault(require("../models/productModel"));
const categoryModel_1 = __importDefault(require("../models/categoryModel"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
// Lấy tất cả sản phẩm (hỗ trợ phân trang, tìm kiếm, sắp xếp)
const getAllProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, idcate, limit, sort, page } = req.query;
        // Xây dựng điều kiện tìm kiếm
        const query = {};
        if (name) {
            query.name = new RegExp(name, 'i');
        }
        if (idcate) {
            if (!mongoose_1.default.Types.ObjectId.isValid(idcate)) {
                res.status(400).json({ status: 'error', message: 'ID danh mục không hợp lệ' });
                return;
            }
            query['category._id'] = idcate;
        }
        const options = {};
        const pageNum = Math.max(parseInt(page) || 1, 1);
        const limitNum = Math.max(parseInt(limit) || 10, 1);
        options.skip = (pageNum - 1) * limitNum;
        options.limit = limitNum;
        if (sort) {
            options.sort = { 'variants.price': sort === 'asc' ? 1 : -1 };
        }
        const [products, total] = yield Promise.all([
            productModel_1.default
                .find(query)
                .select('name slug category image variants is_active')
                .populate('category._id', 'name slug')
                .sort(options.sort)
                .skip(options.skip)
                .limit(options.limit)
                .lean(),
            productModel_1.default.countDocuments(query),
        ]);
        if (!products.length) {
            res.status(404).json({ status: 'error', message: 'Không tìm thấy sản phẩm' });
            return;
        }
        const result = products.map((product) => (Object.assign(Object.assign({}, product), { category: {
                _id: product.category._id,
                name: product.category.name,
            } })));
        res.status(200).json({
            status: 'success',
            data: result,
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
        });
    }
    catch (error) {
        console.error('Lỗi khi lấy tất cả sản phẩm:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});
exports.getAllProducts = getAllProducts;
// Lấy sản phẩm theo ID
const getProductById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({ status: 'error', message: 'ID sản phẩm không hợp lệ' });
            return;
        }
        // Tìm sản phẩm theo ID
        const product = yield productModel_1.default
            .findById(req.params.id)
            .populate('category._id', 'name slug')
            .lean();
        if (!product) {
            res.status(404).json({ status: 'error', message: 'Sản phẩm không tồn tại' });
            return;
        }
        const result = Object.assign(Object.assign({}, product), { category: {
                _id: product.category._id,
                name: product.category.name,
            } });
        res.status(200).json({ status: 'success', data: result });
    }
    catch (error) {
        console.error('Lỗi khi lấy sản phẩm theo ID:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});
exports.getProductById = getProductById;
// Thêm sản phẩm mới
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = req.body;
        if (!product.name ||
            !product.slug ||
            !product.category ||
            !product.category._id ||
            !product.variants ||
            !Array.isArray(product.variants) ||
            product.variants.length === 0) {
            res.status(400).json({
                status: 'error',
                message: 'Thiếu thông tin bắt buộc: name, slug, category._id, hoặc variants',
            });
            return;
        }
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            res.status(400).json({ status: 'error', message: 'Vui lòng upload ít nhất một ảnh' });
            return;
        }
        const validColors = ['Đen', 'Trắng', 'Xám', 'Đỏ'];
        const validSizes = ['S', 'M', 'L', 'XL'];
        for (const variant of product.variants) {
            if (!variant.price ||
                !variant.color ||
                !variant.size ||
                !validColors.includes(variant.color) ||
                !validSizes.includes(variant.size) ||
                variant.stock === undefined ||
                variant.discountPercent === undefined) {
                res.status(400).json({ status: 'error', message: 'Thông tin variant không hợp lệ' });
                return;
            }
        }
        const category = yield categoryModel_1.default.findById(product.category._id).lean();
        if (!category) {
            res.status(404).json({ status: 'error', message: 'Danh mục không tồn tại' });
            return;
        }
        product.category.name = category.name;
        const uploadPromises = req.files.map((file) => new Promise((resolve, reject) => {
            const stream = cloudinary_1.default.uploader.upload_stream({ resource_type: 'image', folder: 'products' }, (error, result) => {
                if (error || !result)
                    return reject(error);
                resolve(result);
            });
            stream.end(file.buffer);
        }));
        const uploadResults = yield Promise.all(uploadPromises);
        product.image = uploadResults.map((result) => result.secure_url);
        const newProduct = new productModel_1.default(product);
        const savedProduct = yield newProduct.save();
        res.status(201).json({
            status: 'success',
            message: 'Tạo sản phẩm thành công',
            data: savedProduct,
        });
    }
    catch (error) {
        console.error('Lỗi khi tạo sản phẩm:', error);
        if (error.code === 11000) {
            res.status(409).json({ status: 'error', message: 'Tên hoặc slug sản phẩm đã tồn tại' });
            return;
        }
        res.status(500).json({ status: 'error', message: error.message });
    }
});
exports.createProduct = createProduct;
// Cập nhật sản phẩm
const updateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productId = req.params.id;
        const product = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(productId)) {
            res.status(400).json({ status: 'error', message: 'ID sản phẩm không hợp lệ' });
            return;
        }
        const existingProduct = yield productModel_1.default.findById(productId);
        if (!existingProduct) {
            res.status(404).json({ status: 'error', message: 'Sản phẩm không tồn tại' });
            return;
        }
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            // Xóa hình ảnh cũ trên Cloudinary
            if (existingProduct.image && existingProduct.image.length > 0) {
                const deletePromises = existingProduct.image.map((img) => {
                    var _a;
                    const publicId = (_a = img.split('/').pop()) === null || _a === void 0 ? void 0 : _a.split('.')[0];
                    if (publicId) {
                        return cloudinary_1.default.uploader.destroy(`products/${publicId}`).catch(() => { });
                    }
                    return Promise.resolve();
                });
                yield Promise.all(deletePromises);
            }
            // Upload hình ảnh mới
            const uploadPromises = req.files.map((file) => new Promise((resolve, reject) => {
                const stream = cloudinary_1.default.uploader.upload_stream({ resource_type: 'image', folder: 'products' }, (error, result) => {
                    if (error || !result)
                        return reject(error);
                    resolve(result);
                });
                stream.end(file.buffer);
            }));
            const uploadResults = yield Promise.all(uploadPromises);
            product.image = uploadResults.map((result) => result.secure_url);
        }
        else {
            product.image = existingProduct.image;
        }
        if (product.category && product.category._id) {
            const category = yield categoryModel_1.default.findById(product.category._id).lean();
            if (!category) {
                res.status(404).json({ status: 'error', message: 'Danh mục không tồn tại' });
                return;
            }
            product.category.name = category.name;
        }
        else {
            product.category = existingProduct.category;
        }
        if (product.variants && Array.isArray(product.variants)) {
            const validColors = ['Đen', 'Trắng', 'Xám', 'Đỏ'];
            const validSizes = ['S', 'M', 'L', 'XL'];
            for (const variant of product.variants) {
                if (!variant.price ||
                    !variant.color ||
                    !variant.size ||
                    !validColors.includes(variant.color) ||
                    !validSizes.includes(variant.size) ||
                    variant.stock === undefined ||
                    variant.discountPercent === undefined) {
                    res.status(400).json({ status: 'error', message: 'Thông tin variant không hợp lệ' });
                    return;
                }
            }
        }
        // Cập nhật sản phẩm trong database
        const updatedProduct = yield productModel_1.default
            .findByIdAndUpdate(productId, { $set: product }, { new: true, runValidators: true })
            .populate('category._id', 'name slug');
        if (!updatedProduct) {
            res.status(404).json({ status: 'error', message: 'Sản phẩm không tồn tại' });
            return;
        }
        const result = Object.assign(Object.assign({}, updatedProduct.toObject()), { category: {
                _id: updatedProduct.category._id,
                name: updatedProduct.category.name,
            } });
        res.status(200).json({
            status: 'success',
            message: 'Cập nhật sản phẩm thành công',
            data: result,
        });
    }
    catch (error) {
        console.error('Lỗi khi cập nhật sản phẩm:', error);
        if (error.code === 11000) {
            res.status(409).json({ status: 'error', message: 'Tên hoặc slug sản phẩm đã tồn tại' });
            return;
        }
        res.status(500).json({ status: 'error', message: error.message });
    }
});
exports.updateProduct = updateProduct;
// Xóa sản phẩm
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productId = req.params.id;
        if (!mongoose_1.default.Types.ObjectId.isValid(productId)) {
            res.status(400).json({ status: 'error', message: 'ID sản phẩm không hợp lệ' });
            return;
        }
        const product = yield productModel_1.default.findById(productId);
        if (!product) {
            res.status(404).json({ status: 'error', message: 'Sản phẩm không tồn tại' });
            return;
        }
        if (product.image && product.image.length > 0) {
            const deletePromises = product.image.map((img) => {
                var _a;
                const publicId = (_a = img.split('/').pop()) === null || _a === void 0 ? void 0 : _a.split('.')[0];
                if (publicId) {
                    return cloudinary_1.default.uploader.destroy(`products/${publicId}`).catch(() => { });
                }
                return Promise.resolve();
            });
            yield Promise.all(deletePromises);
        }
        // Xóa sản phẩm khỏi database
        yield productModel_1.default.findByIdAndDelete(productId);
        res.status(200).json({
            status: 'success',
            message: 'Xóa sản phẩm thành công',
        });
    }
    catch (error) {
        console.error('Lỗi khi xóa sản phẩm:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});
exports.deleteProduct = deleteProduct;
