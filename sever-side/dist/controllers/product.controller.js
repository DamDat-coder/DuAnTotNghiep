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
exports.lockProduct = exports.updateProduct = exports.createProduct = exports.getProductBySlug = exports.getProductById = exports.getAllProducts = exports.getAllProductsAdmin = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const product_model_1 = __importDefault(require("../models/product.model"));
const category_model_1 = __importDefault(require("../models/category.model"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
// Lấy tất cả sản phẩm cho admin
const getAllProductsAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, is_active, limit, sort, page, } = req.query;
        const query = {};
        if (name) {
            query.slug = new RegExp(name, "i");
        }
        if (typeof is_active !== "undefined") {
            if (is_active === "true")
                query.is_active = true;
            else if (is_active === "false")
                query.is_active = false;
            else {
                return res.status(400).json({
                    status: "error",
                    message: "Giá trị 'is_active' phải là 'true' hoặc 'false'.",
                });
            }
        }
        const pageNum = Math.max(parseInt(page) || 1, 1);
        const limitNum = Math.max(parseInt(limit) || 10, 1);
        const skip = (pageNum - 1) * limitNum;
        const sortMap = {
            "newest": { _id: -1 },
            "best-seller": { salesCount: -1 },
            "name-asc": { name: 1 },
            "name-desc": { name: -1 },
        };
        let sortOption = sortMap["newest"];
        if (sort) {
            const sortKey = sort.toString();
            if (!sortMap[sortKey]) {
                return res.status(400).json({
                    status: "error",
                    message: "Tùy chọn sắp xếp không hợp lệ. Hỗ trợ: newest, best-seller, name-asc, name-desc.",
                });
            }
            sortOption = sortMap[sortKey];
        }
        const [products, total] = yield Promise.all([
            product_model_1.default
                .find(query)
                .select("name slug category image variants salesCount is_active")
                .populate("category", "name")
                .sort(sortOption)
                .skip(skip)
                .limit(limitNum)
                .lean(),
            product_model_1.default.countDocuments(query),
        ]);
        if (!products.length) {
            return res
                .status(404)
                .json({ status: "error", message: "Không tìm thấy sản phẩm nào" });
        }
        const result = products.map((product) => {
            var _a, _b;
            return (Object.assign(Object.assign({}, product), { category: {
                    _id: ((_a = product.category) === null || _a === void 0 ? void 0 : _a._id) || null,
                    name: ((_b = product.category) === null || _b === void 0 ? void 0 : _b.name) || "Không rõ",
                } }));
        });
        return res.status(200).json({
            status: "success",
            data: result,
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
        });
    }
    catch (error) {
        console.error("Lỗi khi lấy sản phẩm:", error);
        return res.status(500).json({
            status: "error",
            message: error.message || "Lỗi server khi lấy danh sách sản phẩm",
        });
    }
});
exports.getAllProductsAdmin = getAllProductsAdmin;
// Lấy tất cả sản phẩm 
const getAllProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, id_cate, sort, priceRange, color, size, is_active, } = req.query;
        const query = {};
        // is_active
        if (is_active !== undefined) {
            if (is_active !== 'true' && is_active !== 'false') {
                res.status(400).json({ status: 'error', message: 'Invalid is_active value, must be true or false' });
                return;
            }
            query.is_active = is_active === 'true';
        }
        else {
            query.is_active = true;
        }
        // name
        if (name) {
            query.name = new RegExp(name, 'i');
        }
        // id_cate
        if (id_cate) {
            const categoryIdStr = String(id_cate);
            if (!mongoose_1.default.Types.ObjectId.isValid(categoryIdStr)) {
                res.status(400).json({ status: 'error', message: 'Invalid category ID' });
                return;
            }
            const categoryIds = [categoryIdStr];
            const findChildCategories = (parentId) => __awaiter(void 0, void 0, void 0, function* () {
                const children = yield category_model_1.default.find({ parentid: new mongoose_1.default.Types.ObjectId(parentId) }).select('_id').lean();
                for (const child of children) {
                    const childId = child._id.toString();
                    categoryIds.push(childId);
                    yield findChildCategories(childId);
                }
            });
            yield findChildCategories(categoryIdStr);
            query['category._id'] = { $in: categoryIds.map(id => new mongoose_1.default.Types.ObjectId(id)) };
        }
        // color + size + priceRange cần gộp vào một filter của variant
        const variantConditions = [];
        // color
        if (color) {
            const validColors = ['Đen', 'Trắng', 'Xám', 'Đỏ'];
            if (!validColors.includes(color)) {
                res.status(400).json({ status: 'error', message: 'Invalid color' });
                return;
            }
            variantConditions.push({ 'variants.color': color });
        }
        // size
        if (size) {
            const validSizes = ['S', 'M', 'L', 'XL'];
            if (!validSizes.includes(size)) {
                res.status(400).json({ status: 'error', message: 'Invalid size' });
                return;
            }
            variantConditions.push({ 'variants.size': size });
        }
        // priceRange
        let priceMatch = null;
        if (priceRange) {
            const priceFilters = {
                'under-500k': { $lt: 500000 },
                '500k-1m': { $gte: 500000, $lte: 1000000 },
                '1m-2m': { $gte: 1000000, $lte: 2000000 },
                '2m-4m': { $gte: 2000000, $lte: 4000000 },
                'over-4m': { $gt: 4000000 },
            };
            const filter = priceFilters[priceRange];
            if (!filter) {
                res.status(400).json({ status: 'error', message: `Invalid price range: ${priceRange}` });
                return;
            }
            priceMatch = filter;
        }
        const pipeline = [
            { $match: query },
            { $unwind: '$variants' },
            {
                $addFields: {
                    'variants.discountedPrice': {
                        $multiply: [
                            '$variants.price',
                            { $subtract: [1, { $divide: ['$variants.discountPercent', 100] }] }
                        ]
                    }
                }
            },
        ];
        // $match theo variant cùng lúc
        const variantMatch = {};
        for (const condition of variantConditions) {
            Object.assign(variantMatch, condition);
        }
        if (priceMatch) {
            variantMatch['variants.discountedPrice'] = priceMatch;
        }
        if (Object.keys(variantMatch).length > 0) {
            pipeline.push({ $match: variantMatch });
        }
        // group lại thành sản phẩm
        pipeline.push({
            $group: {
                _id: '$_id',
                name: { $first: '$name' },
                slug: { $first: '$slug' },
                category: { $first: '$category' },
                image: { $first: '$image' },
                variants: { $push: '$variants' },
                is_active: { $first: '$is_active' },
                salesCount: { $first: '$salesCount' },
                minDiscountedPrice: { $min: '$variants.discountedPrice' },
            }
        });
        // sort
        if (sort === 'price-asc' || sort === 'price-desc') {
            pipeline.push({ $sort: { minDiscountedPrice: sort === 'price-asc' ? 1 : -1 } });
        }
        else {
            const sortOptions = {
                newest: { _id: -1 },
                'best-seller': { salesCount: -1 }
            };
            if (sort && sortOptions[sort]) {
                pipeline.push({ $sort: sortOptions[sort] });
            }
        }
        const products = yield product_model_1.default.aggregate(pipeline);
        if (!products.length) {
            res.status(404).json({ status: 'error', message: 'No products found' });
            return;
        }
        const result = products.map(product => (Object.assign(Object.assign({}, product), { category: {
                _id: product.category._id,
                name: product.category.name,
            }, image: product.image || [] })));
        res.status(200).json({
            status: 'success',
            data: result,
            total: result.length,
        });
    }
    catch (error) {
        console.error('Error fetching all products:', error);
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
        const product = yield product_model_1.default
            .findById(req.params.id)
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
// Lấy sản phẩm theo slug
const getProductBySlug = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { slug } = req.params;
        if (!slug || typeof slug !== "string") {
            res.status(400).json({ status: "error", message: "Slug không hợp lệ" });
            return;
        }
        const products = yield product_model_1.default
            .find({ slug: { $regex: slug, $options: "i" } })
            .populate("category", "name")
            .lean();
        if (!products || products.length === 0) {
            res.status(404).json({ status: "error", message: "Không tìm thấy sản phẩm nào" });
            return;
        }
        const result = products.map((product) => {
            var _a, _b;
            return (Object.assign(Object.assign({}, product), { category: {
                    _id: ((_a = product.category) === null || _a === void 0 ? void 0 : _a._id) || null,
                    name: ((_b = product.category) === null || _b === void 0 ? void 0 : _b.name) || "Không rõ",
                } }));
        });
        res.status(200).json({ status: "success", data: result, total: result.length });
    }
    catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message || "Lỗi server khi lấy sản phẩm theo slug",
        });
    }
});
exports.getProductBySlug = getProductBySlug;
// Thêm sản phẩm mới
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = req.body;
        let variantsParsed;
        try {
            variantsParsed = JSON.parse(body.variants);
        }
        catch (_a) {
            return res.status(400).json({
                status: 'error',
                message: 'Trường variants phải là chuỗi JSON hợp lệ',
            });
        }
        const categoryId = body['category._id'] || body.category_id;
        if (!body.name ||
            !body.slug ||
            !categoryId ||
            !variantsParsed ||
            !Array.isArray(variantsParsed) ||
            variantsParsed.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Thiếu thông tin bắt buộc: name, slug, category._id, hoặc variants',
            });
        }
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            return res.status(400).json({ status: 'error', message: 'Vui lòng upload ít nhất một ảnh' });
        }
        const category = yield category_model_1.default.findById(categoryId).lean();
        if (!category) {
            return res.status(404).json({ status: 'error', message: 'Danh mục không tồn tại' });
        }
        const imageUrls = [];
        for (const file of req.files) {
            const result = yield new Promise((resolve, reject) => {
                const stream = cloudinary_1.default.uploader.upload_stream({ resource_type: 'image', folder: 'products' }, (error, result) => {
                    if (error || !result)
                        return reject(error);
                    resolve(result);
                });
                stream.end(file.buffer);
            });
            imageUrls.push(result.secure_url);
        }
        const product = {
            name: body.name,
            slug: body.slug,
            description: body.description || '',
            image: imageUrls,
            category: {
                _id: category._id,
                name: category.name,
            },
            variants: variantsParsed,
            salesCount: Number(body.salesCount) || 0,
            is_active: true,
        };
        const newProduct = new product_model_1.default(product);
        const savedProduct = yield newProduct.save();
        return res.status(201).json({
            status: 'success',
            message: 'Tạo sản phẩm thành công',
            data: savedProduct,
        });
    }
    catch (error) {
        console.error('Lỗi khi tạo sản phẩm:', error);
        if (error.code === 11000) {
            return res.status(409).json({ status: 'error', message: 'Tên hoặc slug sản phẩm đã tồn tại' });
        }
        return res.status(500).json({ status: 'error', message: error.message });
    }
});
exports.createProduct = createProduct;
// Cập nhật sản phẩm
const updateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const productId = req.params.id;
        const product = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(productId)) {
            res.status(400).json({ status: 'error', message: 'ID sản phẩm không hợp lệ' });
            return;
        }
        const existingProduct = yield product_model_1.default.findById(productId);
        if (!existingProduct) {
            res.status(404).json({ status: 'error', message: 'Sản phẩm không tồn tại' });
            return;
        }
        // Nếu có file mới → xoá cũ + upload mới
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            // Xoá ảnh cũ khỏi Cloudinary
            if (existingProduct.image && existingProduct.image.length > 0) {
                for (const img of existingProduct.image) {
                    const publicId = (_a = img.split('/').pop()) === null || _a === void 0 ? void 0 : _a.split('.')[0];
                    if (publicId) {
                        try {
                            yield cloudinary_1.default.uploader.destroy(`products/${publicId}`);
                        }
                        catch (err) {
                            console.error(`Lỗi khi xoá ảnh ${publicId}:`, err);
                        }
                    }
                }
            }
            // Upload ảnh mới
            const imageUrls = [];
            for (const file of req.files) {
                const result = yield new Promise((resolve, reject) => {
                    const stream = cloudinary_1.default.uploader.upload_stream({ resource_type: 'image', folder: 'products' }, (error, result) => {
                        if (error || !result)
                            return reject(error);
                        resolve(result);
                    });
                    stream.end(file.buffer);
                });
                imageUrls.push(result.secure_url);
            }
            product.image = imageUrls;
        }
        else {
            // Giữ ảnh cũ
            product.image = existingProduct.image;
        }
        // Cập nhật thông tin danh mục nếu có
        if ((_b = product.category) === null || _b === void 0 ? void 0 : _b._id) {
            const category = yield category_model_1.default.findById(product.category._id).lean();
            if (!category) {
                res.status(404).json({ status: 'error', message: 'Danh mục không tồn tại' });
                return;
            }
            product.category.name = category.name;
        }
        else {
            product.category = existingProduct.category;
        }
        const updatedProduct = yield product_model_1.default
            .findByIdAndUpdate(productId, { $set: product }, { new: true, runValidators: true })
            .lean();
        if (!updatedProduct) {
            res.status(404).json({ status: 'error', message: 'Sản phẩm không tồn tại' });
            return;
        }
        const result = Object.assign(Object.assign({}, updatedProduct), { category: {
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
// Khóa/Mở khóa sản phẩm
const lockProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productId = req.params.id;
        const { is_active } = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(productId)) {
            res.status(400).json({ status: 'error', message: 'ID sản phẩm không hợp lệ' });
            return;
        }
        if (typeof is_active !== 'boolean') {
            res.status(400).json({ status: 'error', message: 'Trạng thái is_active phải là boolean' });
            return;
        }
        const updatedProduct = yield product_model_1.default
            .findByIdAndUpdate(productId, { $set: { is_active } }, { new: true, runValidators: true })
            .lean();
        if (!updatedProduct) {
            res.status(404).json({ status: 'error', message: 'Sản phẩm không tồn tại' });
            return;
        }
        const result = Object.assign(Object.assign({}, updatedProduct), { category: {
                _id: updatedProduct.category._id,
                name: updatedProduct.category.name,
            } });
        res.status(200).json({
            status: 'success',
            message: `Sản phẩm đã được ${is_active ? 'mở khóa' : 'khóa'} thành công`,
            data: result,
        });
    }
    catch (error) {
        console.error('Lỗi khi khóa/mở khóa sản phẩm:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});
exports.lockProduct = lockProduct;
