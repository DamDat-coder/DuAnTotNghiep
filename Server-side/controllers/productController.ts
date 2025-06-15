import { Request, Response } from 'express';
import mongoose from 'mongoose';
import productModel, { IProduct } from '../models/productModel';
import categoryModel from '../models/categoryModel';
import cloudinary from '../config/cloudinary';
import { UploadApiResponse } from 'cloudinary';

// Lấy tất cả sản phẩm (hỗ trợ phân trang, tìm kiếm, sắp xếp, và lọc theo nhiều tiêu chí)
export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      idcate,
      limit,
      sort,
      page,
      gender,
      priceRange,
      color,
      size,
    } = req.query;

    // Xây dựng điều kiện tìm kiếm
    const query: any = {};

    // Tìm kiếm theo tên sản phẩm
    if (name) {
      query.name = new RegExp(name as string, 'i');
    }

    // Lọc theo danh mục
    if (idcate) {
      if (!mongoose.Types.ObjectId.isValid(idcate as string)) {
        res.status(400).json({ status: 'error', message: 'ID danh mục không hợp lệ' });
        return;
      }
      query['category._id'] = idcate;
    }

    // Lọc theo giới tính (chọn 1)
    if (gender) {
      const validGenders = ['Nam', 'Nữ', 'Unisex'];
      if (!validGenders.includes(gender as string)) {
        res.status(400).json({ status: 'error', message: 'Giới tính không hợp lệ' });
        return;
      }
      query.gender = gender;
    }

    // Lọc theo màu sắc (ít nhất 1 màu trong danh sách)
    if (color) {
      const colors = (color as string).split(',').map(c => c.trim());
      const validColors = ['Đen', 'Trắng', 'Xám', 'Đỏ']; 
      if (!colors.every(c => validColors.includes(c))) {
        res.status(400).json({ status: 'error', message: 'Một hoặc nhiều màu sắc không hợp lệ' });
        return;
      }
      query['variants.color'] = { $in: colors };
    }

    // Lọc theo kích cỡ (chọn 1)
    if (size) {
      const validSizes = ['S', 'M', 'L', 'XL']; 
      if (!validSizes.includes(size as string)) {
        res.status(400).json({ status: 'error', message: 'Kích cỡ không hợp lệ' });
        return;
      }
      query['variants.size'] = size;
    }

    // Lọc theo nhiều khoảng giá
    if (priceRange) {
      const ranges = (priceRange as string).split(',').map(r => r.trim());
      const priceFilters: { [key: string]: any } = {
        'under-500k': { 'variants.price': { $lt: 500000 } },
        '500k-1m': { 'variants.price': { $gte: 500000, $lte: 1000000 } },
        '1m-2m': { 'variants.price': { $gte: 1000000, $lte: 2000000 } },
        '2m-4m': { 'variants.price': { $gte: 2000000, $lte: 4000000 } },
        'over-4m': { 'variants.price': { $gt: 4000000 } },
      };

      const priceQueries = ranges.map(range => {
        if (!priceFilters[range]) {
          throw new Error(`Khoảng giá không hợp lệ: ${range}`);
        }
        return priceFilters[range];
      });

      if (priceQueries.length > 0) {
        query.$or = priceQueries;
      }
    }

    // Thiết lập phân trang
    const options: any = {};
    const pageNum = Math.max(parseInt(page as string) || 1, 1);
    const limitNum = Math.max(parseInt(limit as string) || 10, 1);
    options.skip = (pageNum - 1) * limitNum;
    options.limit = limitNum;

    // Sắp xếp (chọn 1)
    if (sort) {
      const sortOptions: { [key: string]: any } = {
        'price-asc': { 'variants.price': 1 },
        'price-desc': { 'variants.price': -1 },
        'newest': { createdAt: -1 },
        'best-seller': { sold: -1 },
      };

      if (!sortOptions[sort as string]) {
        res.status(400).json({ status: 'error', message: 'Tùy chọn sắp xếp không hợp lệ' });
        return;
      }
      options.sort = sortOptions[sort as string];
    }

    const [products, total] = await Promise.all([
      productModel
        .find(query)
        .select('name slug category image variants is_active gender sold createdAt')
        .populate('category._id', 'name slug')
        .sort(options.sort)
        .skip(options.skip)
        .limit(options.limit)
        .lean(),
      productModel.countDocuments(query),
    ]);

    if (!products.length) {
      res.status(404).json({ status: 'error', message: 'Không tìm thấy sản phẩm' });
      return;
    }

    const result = products.map((product) => ({
      ...product,
      category: {
        _id: product.category._id,
        name: product.category.name,
      },
    }));
   
    res.status(200).json({
      status: 'success',
      data: result,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error: any) {
    console.error('Lỗi khi lấy tất cả sản phẩm:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Lấy sản phẩm theo ID
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400).json({ status: 'error', message: 'ID sản phẩm không hợp lệ' });
      return;
    }

    // Tìm sản phẩm theo ID
    const product = await productModel
      .findById(req.params.id)
      .populate('category._id', 'name slug')
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

// Lấy sản phẩm theo slug
export const getProductBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    if (!slug || typeof slug !== 'string') {
      res.status(400).json({ status: 'error', message: 'Slug không hợp lệ' });
      return;
    }

    // Tìm sản phẩm theo slug
    const product = await productModel
      .findOne({ slug })
      .populate('category._id', 'name slug')
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
    console.error('Lỗi khi lấy sản phẩm theo slug:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Thêm sản phẩm mới
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product: Partial<IProduct> = req.body;

    if (
      !product.name ||
      !product.slug ||
      !product.category ||
      !product.category._id ||
      !product.variants ||
      !Array.isArray(product.variants) ||
      product.variants.length === 0
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

    const validColors = ['Đen', 'Trắng', 'Xám', 'Đỏ'];
    const validSizes = ['S', 'M', 'L', 'XL'];
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
        res.status(400).json({ status: 'error', message: 'Thông tin variant không hợp lệ' });
        return;
      }
    }

    const category = await categoryModel.findById(product.category._id).lean();
    if (!category) {
      res.status(404).json({ status: 'error', message: 'Danh mục không tồn tại' });
      return;
    }
    product.category.name = category.name;

    const uploadPromises = (req.files as Express.Multer.File[]).map(
      (file) =>
        new Promise<UploadApiResponse>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: 'image', folder: 'products' },
            (error, result) => {
              if (error || !result) return reject(error);
              resolve(result);
            }
          );
          stream.end(file.buffer);
        })
    );

    const uploadResults = await Promise.all(uploadPromises);
    product.image = uploadResults.map((result) => result.secure_url);

    const newProduct = new productModel(product);
    const savedProduct = await newProduct.save();

    res.status(201).json({
      status: 'success',
      message: 'Tạo sản phẩm thành công',
      data: savedProduct,
    });
  } catch (error: any) {
    console.error('Lỗi khi tạo sản phẩm:', error);
    if (error.code === 11000) {
      res.status(409).json({ status: 'error', message: 'Tên hoặc slug sản phẩm đã tồn tại' });
      return;
    }
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Cập nhật sản phẩm
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const productId = req.params.id;
    const product: Partial<IProduct> = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      res.status(400).json({ status: 'error', message: 'ID sản phẩm không hợp lệ' });
      return;
    }

    const existingProduct = await productModel.findById(productId);
    if (!existingProduct) {
      res.status(404).json({ status: 'error', message: 'Sản phẩm không tồn tại' });
      return;
    }

    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      // Xóa hình ảnh cũ trên Cloudinary
      if (existingProduct.image && existingProduct.image.length > 0) {
        const deletePromises = existingProduct.image.map((img) => {
          const publicId = img.split('/').pop()?.split('.')[0];
          if (publicId) {
            return cloudinary.uploader.destroy(`products/${publicId}`).catch(() => { });
          }
          return Promise.resolve();
        });
        await Promise.all(deletePromises);
      }

      // Upload hình ảnh mới
      const uploadPromises = (req.files as Express.Multer.File[]).map(
        (file) =>
          new Promise<UploadApiResponse>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { resource_type: 'image', folder: 'products' },
              (error, result) => {
                if (error || !result) return reject(error);
                resolve(result);
              }
            );
            stream.end(file.buffer);
          })
      );

      const uploadResults = await Promise.all(uploadPromises);
      product.image = uploadResults.map((result) => result.secure_url);
    } else {
      product.image = existingProduct.image;
    }

    if (product.category && product.category._id) {
      const category = await categoryModel.findById(product.category._id).lean();
      if (!category) {
        res.status(404).json({ status: 'error', message: 'Danh mục không tồn tại' });
        return;
      }
      product.category.name = category.name;
    } else {
      product.category = existingProduct.category;
    }

    if (product.variants && Array.isArray(product.variants)) {
      const validColors = ['Đen', 'Trắng', 'Xám', 'Đỏ'];
      const validSizes = ['S', 'M', 'L', 'XL'];
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
          res.status(400).json({ status: 'error', message: 'Thông tin variant không hợp lệ' });
          return;
        }
      }
    }

    // Cập nhật sản phẩm trong database
    const updatedProduct = await productModel
      .findByIdAndUpdate(productId, { $set: product }, { new: true, runValidators: true })
      .populate('category._id', 'name slug');

    if (!updatedProduct) {
      res.status(404).json({ status: 'error', message: 'Sản phẩm không tồn tại' });
      return;
    }

    const result = {
      ...updatedProduct.toObject(),
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
  } catch (error: any) {
    console.error('Lỗi khi cập nhật sản phẩm:', error);
    if (error.code === 11000) {
      res.status(409).json({ status: 'error', message: 'Tên hoặc slug sản phẩm đã tồn tại' });
      return;
    }
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Xóa sản phẩm
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const productId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      res.status(400).json({ status: 'error', message: 'ID sản phẩm không hợp lệ' });
      return;
    }

    const product = await productModel.findById(productId);
    if (!product) {
      res.status(404).json({ status: 'error', message: 'Sản phẩm không tồn tại' });
      return;
    }

    if (product.image && product.image.length > 0) {
      const deletePromises = product.image.map((img) => {
        const publicId = img.split('/').pop()?.split('.')[0];
        if (publicId) {
          return cloudinary.uploader.destroy(`products/${publicId}`).catch(() => { });
        }
        return Promise.resolve();
      });
      await Promise.all(deletePromises);
    }

    // Xóa sản phẩm khỏi database
    await productModel.findByIdAndDelete(productId);

    res.status(200).json({
      status: 'success',
      message: 'Xóa sản phẩm thành công',
    });
  } catch (error: any) {
    console.error('Lỗi khi xóa sản phẩm:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};
