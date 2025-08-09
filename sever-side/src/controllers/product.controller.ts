import { Request, Response } from 'express';
import mongoose from 'mongoose';
import productModel, { IProduct } from '../models/product.model';
import categoryModel from '../models/category.model';
import cloudinary from '../config/cloudinary';
import { UploadApiResponse } from 'cloudinary';
import UserModel from "../models/user.model";
import NotificationModel from "../models/notification.model";
import slugify from "slugify";
import { getAllChildCategoryIds } from "../utils/category.util";
import { removeVietnameseTones } from "../utils/string.util";

// Lấy tất cả sản phẩm cho người dùng
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const { id_cate, color, size, minPrice, maxPrice, is_active, sort_by } = req.query;

    const filter: Record<string, any> = {};

    if (id_cate && typeof id_cate === "string") {
      const allIds = [id_cate];
      const childIds = await getAllChildCategoryIds(id_cate);
      allIds.push(...childIds);

      const validObjectIds = allIds
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id as string));

      filter["category._id"] = { $in: validObjectIds };
    }

    if (color) filter["variants.color"] = color;
    if (size) filter["variants.size"] = size;

    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceFilter: Record<string, number> = {};
      if (minPrice !== undefined && !isNaN(Number(minPrice))) {
        priceFilter.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined && !isNaN(Number(maxPrice))) {
        priceFilter.$lte = Number(maxPrice);
      }
      if (Object.keys(priceFilter).length > 0) {
        filter["variants.price"] = priceFilter;
      }
    }

    if (is_active !== undefined) {
      filter.is_active = is_active === "true";
    }

    let sort: Record<string, any> = {};
    switch (sort_by) {
      case "newest":
        sort = { createdAt: -1 };
        break;
      case "oldest":
        sort = { createdAt: 1 };
        break;
      case "price_asc":
        sort = { "variants.price": 1 };
        break;
      case "price_desc":
        sort = { "variants.price": -1 };
        break;
      case "best_selling":
        sort = { salesCount: -1 };
        break;
    }

    const products = await productModel.find(filter).sort(sort);
    const total = await productModel.countDocuments(filter);

    res.json({
      success: true,
      total,
      data: products,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách sản phẩm.",
      error: err,
    });
  }
};

// Lấy tất cả sản phẩm cho admin
export const getAllProductsAdmin = async (req: Request, res: Response): Promise<Response> => {
  try {
    const {
      name,        
      is_active,
      sort,
    } = req.query;

    const query: Record<string, any> = {};

    if (name) {
      query.slug = new RegExp(name as string, "i");
    }

    if (typeof is_active !== "undefined") {
      if (is_active === "true") query.is_active = true;
      else if (is_active === "false") query.is_active = false;
      else {
        return res.status(400).json({
          status: "error",
          message: "Giá trị 'is_active' phải là 'true' hoặc 'false'.",
        });
      }
    }

    const sortMap: Record<string, any> = {
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
          message:
            "Tùy chọn sắp xếp không hợp lệ. Hỗ trợ: newest, best-seller, name-asc, name-desc.",
        });
      }
      sortOption = sortMap[sortKey];
    }

    const [products, total] = await Promise.all([
      productModel
        .find(query)
        .select("name slug category image variants salesCount is_active")
        .populate("category", "name")
        .sort(sortOption)
        .lean(),
      productModel.countDocuments(query),
    ]);

    if (!products.length) {
      return res
        .status(404)
        .json({ status: "error", message: "Không tìm thấy sản phẩm nào" });
    }

    const result = products.map((product) => ({
      ...product,
      category: {
        _id: product.category?._id || null,
        name: product.category?.name || "Không rõ",
      },
    }));

    return res.status(200).json({
      status: "success",
      data: result,
      total,
    });
  } catch (error: any) {
    console.error("Lỗi khi lấy sản phẩm:", error);
    return res.status(500).json({
      status: "error",
      message: error.message || "Lỗi server khi lấy danh sách sản phẩm",
    });
  }
};

// Lấy sản phẩm theo ID
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400).json({ status: 'error', message: 'ID sản phẩm không hợp lệ' });
      return;
    }

    const product = await productModel
      .findById(req.params.id)
      .lean();

    if (!product) {
      res.status(404).json({ status: 'error', message: 'Sản phẩm không tồn tại' });
      return;
    }

    const result = {
      ...product,
      category: {
        _id: product.category._id,
        name: product.category.name,
      },
    };

    res.status(200).json({ status: 'success', data: result });
  } catch (error: any) {
    console.error('Lỗi khi lấy sản phẩm theo ID:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getProductsActiveStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productIds } = req.body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      res.status(400).json({
        status: 'error',
        message: 'Danh sách productIds phải là mảng và không được rỗng',
      });
      return;
    }

    // Lọc các ID hợp lệ
    const validIds = productIds.filter((id: string) =>
      mongoose.Types.ObjectId.isValid(id)
    );

    if (validIds.length === 0) {
      res.status(400).json({
        status: 'error',
        message: 'Không có ID sản phẩm hợp lệ',
      });
      return;
    }

    const products = await productModel
      .find(
        { _id: { $in: validIds } },
        { _id: 1, is_active: 1 }
      )
      .lean();

    const result = productIds.map((id: string) => ({
      id,
      is_active: products.find((p) => p._id.toString() === id)?.is_active ?? false,
    }));

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error: any) {
    console.error('Lỗi khi kiểm tra trạng thái sản phẩm:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Lỗi server khi kiểm tra trạng thái sản phẩm',
    });
  }
};

// Lấy sản phẩm theo slug 
export const getProductBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const isExact = req.query.exact === "true";

    if (!slug || typeof slug !== "string") {
      res.status(400).json({ status: "error", message: "Slug không hợp lệ" });
      return;
    }

    const normalizedSlug = slugify(removeVietnameseTones(slug), { lower: true });

    if (isExact) {
      const product = await productModel
        .findOne({ slug: normalizedSlug })
        .populate("category", "name")
        .lean();

      if (!product) {
        res.status(404).json({
          status: "error",
          message: "Không tìm thấy sản phẩm trùng khớp chính xác.",
          matchedExactly: false,
        });
        return;
      }

      res.status(200).json({
        status: "success",
        data: {
          ...product,
          category: {
            _id: product.category?._id || null,
            name: product.category?.name || "Không rõ",
          },
        },
        matchedExactly: true,
      });
      return;
    }

    const products = await productModel
      .find({ slug: { $regex: normalizedSlug, $options: "i" } })
      .populate("category", "name")
      .lean();

    if (!products || products.length === 0) {
      res.status(404).json({
        status: "error",
        message: "Không tìm thấy sản phẩm phù hợp.",
        matchedExactly: false,
      });
      return;
    }

    const matchedExactly = products.some(p => p.slug === normalizedSlug);

    const result = products.map((product) => ({
      ...product,
      category: {
        _id: product.category?._id || null,
        name: product.category?.name || "Không rõ",
      },
    }));

    res.status(200).json({
      status: "success",
      data: result,
      total: result.length,
      matchedExactly,
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message || "Lỗi server khi tìm sản phẩm theo slug.",
    });
  }
};


// Thêm sản phẩm mới
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body;

    let variantsParsed;
    try {
      variantsParsed = JSON.parse(body.variants);
    } catch {
      res.status(400).json({
        status: 'error',
        message: 'Trường variants phải là chuỗi JSON hợp lệ',
      });
      return;
    }

    const categoryId = body['category._id'] || body.category_id;

    if (
      !body.name ||
      !body.slug ||
      !categoryId ||
      !variantsParsed ||
      !Array.isArray(variantsParsed) ||
      variantsParsed.length === 0
    ) {
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

    const category = await categoryModel.findById(categoryId).lean();
    if (!category) {
      res.status(404).json({ status: 'error', message: 'Danh mục không tồn tại' });
      return;
    }

    const imageUrls: string[] = await Promise.all(
      (req.files as Express.Multer.File[]).map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { resource_type: 'image', folder: 'products' },
              (error, result) => {
                if (error || !result) return reject(error);
                resolve(result.secure_url);
              }
            );
            stream.end(file.buffer);
          })
      )
    );

    const product: Partial<IProduct> = {
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

    const newProduct = new productModel(product);
    const savedProduct = await newProduct.save();

    res.status(201).json({
      status: 'success',
      message: 'Tạo sản phẩm thành công',
      data: savedProduct,
    });

    setImmediate(async () => {
      try {
        const users = await UserModel.find({}).select("_id").lean();
        const notifications = users.map((user) => ({
          userId: user._id,
          title: "Sản phẩm mới vừa ra mắt!",
          message: `Sản phẩm "${savedProduct.name}" đã có mặt trên Shop For Real, khám phá ngay!`,
          type: "product",
          isRead: false,
          link: `/products/${savedProduct._id}`,
        }));
        await NotificationModel.insertMany(notifications);
        console.log("Thông báo đã gửi đến người dùng.");
      } catch (notiError) {
        console.error("Gửi thông báo thất bại:", notiError);
      }
    });

  } catch (error: any) {
    console.error("Lỗi khi tạo sản phẩm:", error);
    if (error.code === 11000) {
      res.status(409).json({ status: "error", message: "Tên hoặc slug sản phẩm đã tồn tại" });
    } else {
      res.status(500).json({ status: "error", message: error.message });
    }
  }
};

// Cập nhật sản phẩm
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const productId = req.params.id;
    const product = req.body as any;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      res.status(400).json({ status: 'error', message: 'ID sản phẩm không hợp lệ' });
      return;
    }

    const existingProduct = await productModel.findById(productId);
    if (!existingProduct) {
      res.status(404).json({ status: 'error', message: 'Sản phẩm không tồn tại' });
      return;
    }

    // Xử lý ảnh nếu có upload mới
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      if (existingProduct.image && existingProduct.image.length > 0) {
        for (const img of existingProduct.image) {
          const publicId = img.split('/').pop()?.split('.')[0];
          if (publicId) {
            try {
              await cloudinary.uploader.destroy(`products/${publicId}`);
            } catch (err) {
              console.error(`Lỗi khi xoá ảnh ${publicId}:`, err);
            }
          }
        }
      }
      const imageUrls: string[] = [];
      for (const file of req.files as Express.Multer.File[]) {
        const result = await new Promise<UploadApiResponse>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: 'image', folder: 'products' },
            (error, result) => {
              if (error || !result) return reject(error);
              resolve(result);
            }
          );
          stream.end(file.buffer);
        });
        imageUrls.push(result.secure_url);
      }
      product.image = imageUrls;
    } else {
      product.image = existingProduct.image;
    }

    if (typeof product.variants === 'string') {
      try {
        product.variants = JSON.parse(product.variants);
      } catch (error) {
        res.status(400).json({ status: 'error', message: 'Định dạng variants không hợp lệ' });
        return;
      }
    }

    let newCategory = existingProduct.category;
    const categoryId = product.categoryId || product['category._id'];
    if (categoryId) {
      const category = await categoryModel.findById(categoryId).lean();
      if (!category) {
        res.status(404).json({ status: 'error', message: 'Danh mục không tồn tại' });
        return;
      }
      newCategory = {
        _id: category._id,
        name: category.name,
      };
    }

    delete product.category;
    delete product.categoryId;
    delete product['category._id'];
    const updateData: any = {
      ...product,
      category: newCategory,
    };

    const updatedProduct = await productModel
      .findByIdAndUpdate(productId, { $set: updateData }, { new: true, runValidators: true })
      .lean();

    if (!updatedProduct) {
      res.status(404).json({ status: 'error', message: 'Sản phẩm không tồn tại' });
      return;
    }

    const result = {
      ...updatedProduct,
      category: {
        _id: updatedProduct.category._id,
        name: updatedProduct.category.name,
      },
    };

    res.status(200).json({
      status: 'success',
      message: 'Cập nhật sản phẩm thành công',
      data: result,
    });

    // Gửi thông báo cho user
    setImmediate(() => {
      (async () => {
        try {
          const users = await UserModel.find({}).select("_id").lean();
          const notifications = users.map((user) => ({
            userId: user._id,
            title: "Sản phẩm vừa được cập nhật!",
            message: `Sản phẩm "${updatedProduct.name}" vừa được cập nhật, xem ngay!`,
            type: "product",
            isRead: false,
          }));
          await NotificationModel.insertMany(notifications);
          console.log("Thông báo cập nhật sản phẩm đã gửi.");
        } catch (error) {
          console.error("❌ Gửi thông báo thất bại:", error);
        }
      })();
    });

  } catch (error: any) {
    console.error('Lỗi khi cập nhật sản phẩm:', error);
    if (error.code === 11000) {
      res.status(409).json({ status: 'error', message: 'Tên hoặc slug sản phẩm đã tồn tại' });
    } else {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }
};

// Khóa/Mở khóa sản phẩm
export const lockProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const productId = req.params.id;
    const { is_active } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      res.status(400).json({ status: 'error', message: 'ID sản phẩm không hợp lệ' });
      return;
    }

    if (typeof is_active !== 'boolean') {
      res.status(400).json({ status: 'error', message: 'Trạng thái is_active phải là boolean' });
      return;
    }

    const updatedProduct = await productModel
      .findByIdAndUpdate(
        productId,
        { $set: { is_active } },
        { new: true, runValidators: true }
      )
      .lean();

    if (!updatedProduct) {
      res.status(404).json({ status: 'error', message: 'Sản phẩm không tồn tại' });
      return;
    }

    const result = {
      ...updatedProduct,
      category: {
        _id: updatedProduct.category._id,
        name: updatedProduct.category.name,
      },
    };

    res.status(200).json({
      status: 'success',
      message: `Sản phẩm đã được ${is_active ? 'mở khóa' : 'khóa'} thành công`,
      data: result,
    });
  } catch (error: any) {
    console.error('Lỗi khi khóa/mở khóa sản phẩm:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
}; 