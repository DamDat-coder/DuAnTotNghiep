const multer = require("multer");
const fs = require("fs");
const fsPromises = require("fs").promises;
const path = require("path");

const uploadDir = path.join(__dirname, "../public/images");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const checkfile = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
    return cb(new Error("Bạn chỉ được upload file ảnh (jpg, jpeg, png, gif, webp)"));
  }
  return cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: checkfile,
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn kích thước file 5MB, không giới hạn số lượng
});

const categories = require("../models/categoryModel");
const products = require("../models/productModel");

// Lấy tất cả sản phẩm
const getAllProducts = async (req, res) => {
  try {
    const { name, idcate, limit, sort, page } = req.query;
    let query = {};
    let options = {};

    if (name) query.name = new RegExp(name, "i");
    if (idcate) query.categoryId = idcate;
    if (limit) options.limit = parseInt(limit) || 10;
    if (sort) options.sort = { price: sort === "asc" ? 1 : -1 };
    const pageNum = parseInt(page) || 1;
    options.skip = (pageNum - 1) * (options.limit || 10);

    const total = await products.countDocuments(query);
    const arr = await products.find(query, null, options).populate("categoryId", "name");

    if (!arr.length) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    res.json({
      data: arr,
      total,
      page: pageNum,
      limit: options.limit || 10,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Lấy sản phẩm theo ID
const getProductById = async (req, res) => {
  try {
    const product = await products.findById(req.params.id).populate("categoryId", "name");
    if (!product) return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Thêm sản phẩm (không giới hạn số ảnh)
const addPro = [
  upload.array("image"), // Loại bỏ giới hạn 6 ảnh
  async (req, res) => {
    try {
      const product = req.body;
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "Vui lòng upload ít nhất một ảnh" });
      }
      if (!product.name || !product.price || !product.categoryId) {
        return res.status(400).json({ message: "Thiếu thông tin bắt buộc: name, price, hoặc categoryId" });
      }

      product.image = req.files.map((file) => file.filename);
      const category = await categories.findById(product.categoryId);
      if (!category) throw new Error("Danh mục không tồn tại");

      const newProduct = new products(product);
      const data = await newProduct.save();
      res.status(201).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  },
];

// Sửa sản phẩm (không giới hạn số ảnh)
const editPro = [
  upload.array("image"), // Loại bỏ giới hạn 6 ảnh
  async (req, res) => {
    try {
      const product = req.body;
      const existingProduct = await products.findById(req.params.id);
      if (!existingProduct) return res.status(404).json({ message: "Sản phẩm không tồn tại" });

      if (req.files && req.files.length > 0) {
        if (existingProduct.image && existingProduct.image.length > 0) {
          await Promise.all(
            existingProduct.image.map((img) => fsPromises.unlink(path.join(uploadDir, img)).catch(() => {}))
          );
        }
        product.image = req.files.map((file) => file.filename);
      } else {
        product.image = existingProduct.image;
      }

      const category = await categories.findById(product.categoryId);
      if (!category) throw new Error("Danh mục không tồn tại");

      const data = await products.findByIdAndUpdate(req.params.id, product, { new: true });
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  },
];

// Xóa sản phẩm
const deletePro = async (req, res) => {
  try {
    const data = await products.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ message: "Sản phẩm không tồn tại" });

    if (data.image && data.image.length > 0) {
      await Promise.all(
        data.image.map((img) => fsPromises.unlink(path.join(uploadDir, img)).catch(() => {}))
      );
    }

    res.json({ message: "Xóa sản phẩm thành công", data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  addPro,
  editPro,
  deletePro,
};