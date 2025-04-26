import { Request, Response } from "express";
import categoryModel from "../models/categoryModel";
import productModel, { IProduct } from "../models/productModel";
import path from "path";
import fsPromises from "fs/promises";

const uploadDir = path.join(__dirname, "../public/images");

// GET all products
export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  const { name, idcate, limit, sort, page, gender, discount } = req.query;

  const query: any = {};
  const options: any = {};

  if (name) query.name = new RegExp(name as string, "i");
  if (idcate) query.categoryId = idcate;
  if (gender) query.gender = gender;
  if (discount === "true") query.discount = true;

  if (limit) options.limit = parseInt(limit as string) || 10;
  if (sort) options.sort = { price: sort === "asc" ? 1 : -1 };

  const pageNum = parseInt(page as string) || 1;
  options.skip = (pageNum - 1) * (options.limit || 10);

  try {
    const total = await productModel.countDocuments(query);
    const arr = await productModel
      .find(query, null, options)
      .populate("categoryId", "name")
      .exec();

    if (!arr.length) {
      res.status(404).json({ message: "Không tìm thấy sản phẩm" });
      return;
    }

    res.json({ data: arr, total, page: pageNum, limit: options.limit || 10 });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// GET product by ID
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await productModel
      .findById(req.params.id)
      .populate("categoryId", "name")
      .exec();

    if (!product) {
      res.status(404).json({ message: "Sản phẩm không tồn tại" });
      return;
    }
    res.json(product);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// POST create product
export const addPro = async (req: Request, res: Response): Promise<void> => {
  const product = req.body as IProduct;

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

  product.image = (req.files as Express.Multer.File[]).map((file) => file.filename);

  try {
    const category = await categoryModel.findById(product.categoryId);
    if (!category) {
      res.status(404).json({ message: "Danh mục không tồn tại" });
      return;
    }

    const newProduct = new productModel(product);
    const data = await newProduct.save();
    res.status(201).json(data);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// PUT update product
export const editPro = async (req: Request, res: Response): Promise<void> => {
  const product = req.body as IProduct;

  try {
    const existingProduct = await productModel.findById(req.params.id);
    if (!existingProduct) {
      res.status(404).json({ message: "Sản phẩm không tồn tại" });
      return;
    }

    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      if (existingProduct.image && existingProduct.image.length > 0) {
        await Promise.all(
          existingProduct.image.map((img) =>
            fsPromises.unlink(path.join(uploadDir, img)).catch(() => {})
          )
        );
      }
      product.image = (req.files as Express.Multer.File[]).map((file) => file.filename);
    } else {
      product.image = existingProduct.image;
    }

    const category = await categoryModel.findById(product.categoryId);
    if (!category) {
      res.status(404).json({ message: "Danh mục không tồn tại" });
      return;
    }

    const data = await productModel
      .findByIdAndUpdate(req.params.id, { $set: product }, { new: true })
      .exec();

    if (!data) {
      res.status(404).json({ message: "Sản phẩm không tồn tại" });
      return;
    }
    res.json(data);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// DELETE product
export const deletePro = (req: Request, res: Response): void => {
  productModel.findByIdAndDelete(req.params.id, (err: any, data: IProduct | null) => {
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
      Promise.all(
        data.image.map((img) =>
          fsPromises.unlink(path.join(uploadDir, img)).catch(() => {})
        )
      ).then(() => {
        res.json({ message: "Xóa sản phẩm thành công", data });
      });
    } else {
      res.json({ message: "Xóa sản phẩm thành công", data });
    }
  });
};