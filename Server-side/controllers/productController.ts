import { Request, Response } from 'express';
import mongoose from 'mongoose';
import productModel, { IProduct } from '../models/productModel';
import categoryModel from '../models/categoryModel';
import cloudinary from '../config/cloudinary';
import { UploadApiResponse } from 'cloudinary';

// Lấy tất cả sản phẩm bên admin
export const getAllProductsAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      limit,
      sort,
      page,
    } = req.query;

    // Xây dựng điều kiện tìm kiếm
    const query: any = {};

    // Tìm kiếm theo tên sản phẩm
    if (name) {
      query.name = new RegExp(name as string, 'i');
    }

    // Thiết lập phân trang
    const options: any = {};
    const pageNum = Math.max(parseInt(page as string) || 1, 1);
    const limitNum = Math.max(parseInt(limit as string) || 10, 10); // Mặc định limit là 10
    options.skip = (pageNum - 1) * limitNum;
    options.limit = limitNum;

    // Sắp xếp
    if (sort) {
      const sortOptions: { [key: string]: any } = {
        'newest': { _id: -1 },
        'best-seller': { salesCount: -1 },
        'name-asc': { name: 1 },
        'name-desc': { name: -1 },
      };

      if (!sortOptions[sort as string]) {
        res.status(400).json({ status: 'error', message: 'Tùy chọn sắp xếp không hợp lệ. Chỉ hỗ trợ: newest, best-seller, name-asc, name-desc' });
        return;
      }
      options.sort = sortOptions[sort as string];
    } else {
      options.sort = { _id: -1 }; // Mặc định sắp xếp theo mới nhất
    }

    const [products, total] = await Promise.all([
      productModel
        .find(query)
        .select('name slug category image variants salesCount')
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
// Lấy tất cả sản phẩm 
export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      id_cate,
      sort,
      priceRange,
      color,
      size,
      is_active,
    } = req.query;

    // Build search conditions
    const query: any = {};

    // Check is_active status
    if (is_active !== undefined) {
      if (is_active !== 'true' && is_active !== 'false') {
        res.status(400).json({ status: 'error', message: 'Invalid is_active value, must be true or false' });
        return;
      }
      query.is_active = is_active === 'true';
    } else {
      query.is_active = true;
    }

    // Search by product name
    if (name) {
      query.name = new RegExp(name as string, 'i');
    }

    // Filter by category (including parent and all child categories)
    if (id_cate) {
      const categoryIdStr = String(id_cate);
      if (!mongoose.Types.ObjectId.isValid(categoryIdStr)) {
        res.status(400).json({ status: 'error', message: 'Invalid category ID' });
        return;
      }

      // Get all child categories of the parent (including nested levels) and include parent
      const categoryIds = [categoryIdStr]; 
      const findChildCategories = async (parentId: string) => {
        const children = await categoryModel
          .find({ parentid: new mongoose.Types.ObjectId(parentId) })
          .select('_id')
          .lean();
        for (const child of children) {
          categoryIds.push(child._id.toString());
          await findChildCategories(child._id.toString());
        }
      };

      await findChildCategories(categoryIdStr);
      if (categoryIds.length === 1) {
        console.warn(`No child categories found for parent ID ${categoryIdStr}`);
      }

      query['category._id'] = { $in: categoryIds.map(id => new mongoose.Types.ObjectId(id)) };
    }

    // Filter by color
    if (color) {
      const colors = (color as string).split(',').map(c => c.trim());
      const validColors = ['Đen', 'Trắng', 'Xám', 'Đỏ'];
      if (!colors.every(c => validColors.includes(c))) {
        res.status(400).json({ status: 'error', message: 'One or more colors are invalid' });
        return;
      }
      query['variants.color'] = { $in: colors };
    }

    // Filter by size
    if (size) {
      const validSizes = ['S', 'M', 'L', 'XL'];
      if (!validSizes.includes(size as string)) {
        res.status(400).json({ status: 'error', message: 'Invalid size' });
        return;
      }
      query['variants.size'] = size;
    }

    // Filter by price range
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
          throw new Error(`Invalid price range: ${range}`);
        }
        return priceFilters[range];
      });

      if (priceQueries.length > 0) {
        query.$or = priceQueries;
      }
    }

    // Sorting options
    const options: any = {};
    if (sort) {
      const sortOptions: { [key: string]: any } = {
        'price-asc': { 'variants.price': 1 },
        'price-desc': { 'variants.price': -1 },
        'newest': { _id: -1 },
        'best-seller': { salesCount: -1 },
      };

      if (!sortOptions[sort as string]) {
        res.status(400).json({ status: 'error', message: 'Invalid sort option' });
        return;
      }
      options.sort = sortOptions[sort as string];
    }

    // Fetch all products
    const products = await productModel
      .find(query)
      .select('name slug category image variants is_active salesCount discountPercent')
      .sort(options.sort)
      .lean();

    if (!products.length) {
      res.status(404).json({ status: 'error', message: 'No products found' });
      return;
    }

    // Map response to include category details and image array
    const result = products.map((product) => ({
      ...product,
      category: {
        _id: product.category._id,
        name: product.category.name,
      },
      image: product.image || [], // Ensure image is an array
    }));

    res.status(200).json({
      status: 'success',
      data: result,
      total: products.length,
    });
  } catch (error: any) {
    console.error('Error fetching all products:', error);
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

// Lấy sản phẩm theo slug
export const getProductBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    if (!slug || typeof slug !== 'string') {
      res.status(400).json({ status: 'error', message: 'Slug không hợp lệ' });
      return;
    }

    const product = await productModel
      .findOne({ slug })
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
      !product.category?._id ||
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
            return cloudinary.uploader.destroy(`products/${publicId}`).catch((err) => {
              console.error(`Lỗi khi xóa ảnh ${publicId}:`, err);
            });
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

    if (product.category?._id) {
      const category = await categoryModel.findById(product.category._id).lean();
      if (!category) {
        res.status(404).json({ status: 'error', message: 'Danh mục không tồn tại' });
        return;
      }
      product.category.name = category.name;
    } else {
      product.category = existingProduct.category;
    }

    const updatedProduct = await productModel
      .findByIdAndUpdate(productId, { $set: product }, { new: true, runValidators: true })
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
          return cloudinary.uploader.destroy(`products/${publicId}`).catch((err) => {
            console.error(`Lỗi khi xóa ảnh ${publicId}:`, err);
          });
        }
        return Promise.resolve();
      });
      await Promise.all(deletePromises);
    }

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