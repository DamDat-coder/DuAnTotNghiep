import { Request, Response } from "express";
import categoryModel from "../models/categoryModel";
import productModel, { IProduct } from "../models/productModel";
import cloudinary from "../config/cloudinary";
import { UploadApiResponse } from "cloudinary";

// lấy tất cả sản phẩm
export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  const { name, idcate, limit, sort, page } = req.query;

  const query: any = {};
  const options: any = {};

  if (name) query.name = new RegExp(name as string, "i");
  if (idcate) query["category._id"] = idcate;

  if (limit) options.limit = parseInt(limit as string) || 10;
  if (sort) {
    options.sort = { "variants.price": sort === "asc" ? 1 : -1 };
  }

  const pageNum = parseInt(page as string) || 1;
  options.skip = (pageNum - 1) * (options.limit || 10);

  try {
    const total = await productModel.countDocuments(query);
    const arr = await productModel
      .find(query, null, options)
      .populate("category._id", "name")
      .exec();

    if (!arr.length) {
      res.status(404).json({ message: "Không tìm thấy sản phẩm" });
      return;
    }

    const result = arr.map((product) => ({
      ...product.toObject(),
      category: {
        _id: product.category._id,
        name: product.category.name,
      },
    }));

    res.json({ data: result, total, page: pageNum, limit: options.limit || 10 });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// lấy sản phẩm theo id
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await productModel
      .findById(req.params.id)
      .populate("category._id", "name")
      .exec();

    if (!product) {
      res.status(404).json({ message: "Sản phẩm không tồn tại" });
      return;
    }

    const result = {
      ...product.toObject(),
      category: {
        _id: product.category._id,
        name: product.category.name,
      },
    };

    res.json(result);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


export const addPro = async (req: Request, res: Response): Promise<void> => {
  const product: Partial<IProduct> = req.body;

  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    res.status(400).json({ message: "Vui lòng upload ít nhất một ảnh" });
    return;
  }

  if (
    !product.name ||
    !product.category ||
    !product.category._id ||
    !product.variants ||
    !Array.isArray(product.variants) ||
    product.variants.length === 0
  ) {
    res.status(400).json({
      message: "Thiếu thông tin bắt buộc: name, category._id, hoặc variants",
    });
    return;
  }

  // Validate variants
  const validColors = ["Đen", "Trắng", "Xám", "Đỏ"];
  const validSizes = ["S", "M", "L", "XL"];
  for (const variant of product.variants) {
    if (
      !variant.price ||
      !variant.color ||
      !variant.size ||
      !validColors.includes(variant.color) ||
      !validSizes.includes(variant.size) ||
      variant.stock === undefined ||
      variant.discountPercent === undefined
    ) {
      res.status(400).json({ message: "Thông tin variant không hợp lệ" });
      return;
    }
  }

  try {
    // ✅ SỬA: Bọc upload_stream thành Promise
    const uploadPromises = (req.files as Express.Multer.File[]).map((file) => {
      return new Promise<UploadApiResponse>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "image", folder: "products" },
          (error, result) => {
            if (error || !result) return reject(error);
            resolve(result);
          }
        );
        stream.end(file.buffer);
      });
    });

    const uploadResults = await Promise.all(uploadPromises);
    product.image = uploadResults.map((result) => result.secure_url);

    // Validate category
    const category = await categoryModel.findById(product.category._id);
    if (!category) {
      res.status(404).json({ message: "Danh mục không tồn tại" });
      return;
    }
    product.category.name = category.name;

    // Save product
    const newProduct = new productModel(product);
    const data = await newProduct.save();
    res.status(201).json(data);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// update sản phẩm
export const editPro = async (req: Request, res: Response): Promise<void> => {
  const product: Partial<IProduct> = req.body;

  try {
    const existingProduct = await productModel.findById(req.params.id);
    if (!existingProduct) {
      res.status(404).json({ message: "Sản phẩm không tồn tại" });
      return;
    }

    // update hình
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      // xóa hình khỏi Cloudinary
      if (existingProduct.image && existingProduct.image.length > 0) {
        const deletePromises = existingProduct.image.map((img) => {
          const publicId = img.split("/").pop()?.split(".")[0]; // Extract public_id from URL
          if (publicId) {
            return cloudinary.uploader.destroy(`products/${publicId}`).catch(() => { });
          }
          return Promise.resolve();
        });
        await Promise.all(deletePromises);
      }

      // up hình cloudinary
      const uploadPromises = (req.files as Express.Multer.File[]).map((file) => {
        return new Promise<UploadApiResponse>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: "image", folder: "products" },
            (error, result) => {
              if (error || !result) return reject(error);
              resolve(result);
            }
          );
          stream.end(file.buffer);
        });
      });


      const uploadResults = await Promise.all(uploadPromises);
      product.image = uploadResults.map((result: UploadApiResponse) => result.secure_url);
    } else {
      product.image = existingProduct.image;
    }

    if (product.category && product.category._id) {
      const category = await categoryModel.findById(product.category._id);
      if (!category) {
        res.status(404).json({ message: "Danh mục không tồn tại" });
        return;
      }
      product.category.name = category.name;
    } else {
      product.category = existingProduct.category;
    }

    if (product.variants && Array.isArray(product.variants)) {
      const validColors = ["Đen", "Trắng", "Xám", "Đỏ"];
      const validSizes = ["S", "M", "L", "XL"];
      for (const variant of product.variants) {
        if (
          !variant.price ||
          !variant.color ||
          !variant.size ||
          !validColors.includes(variant.color) ||
          !validSizes.includes(variant.size) ||
          variant.stock === undefined ||
          variant.discountPercent === undefined
        ) {
          res.status(400).json({ message: "Thông tin variant không hợp lệ" });
          return;
        }
      }
    }

    // Update product
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
export const deletePro = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await productModel.findByIdAndDelete(req.params.id).exec();
    if (!data) {
      res.status(404).json({ message: "Sản phẩm không tồn tại" });
      return;
    }

    // xóa hìnhhình
    if (data.image && data.image.length > 0) {
      const deletePromises = data.image.map((img) => {
        const publicId = img.split("/").pop()?.split(".")[0]; 
        if (publicId) {
          return cloudinary.uploader.destroy(`products/${publicId}`).catch(() => { });
        }
        return Promise.resolve();
      });
      await Promise.all(deletePromises);
    }

    res.json({ message: "Xóa sản phẩm thành công", data });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};