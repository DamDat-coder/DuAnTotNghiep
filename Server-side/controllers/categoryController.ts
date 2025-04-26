import { Request, Response } from 'express';
import mongoose from 'mongoose';
import categoryModel, { ICategory } from '../models/categoryModel';
import newsModel from '../models/newsModel';
import productModel from '../models/productModel';

// Lấy tất cả danh mục
export const getAllCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit as string) || 10, 1);
    const skip = (page - 1) * limit;
    const parentId = req.query.parentId as string | null;

    const query = parentId ? { parentId } : { parentId: null };
    const categories = await categoryModel
      .find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate('parentId', 'name')
      .lean();

    const total = await categoryModel.countDocuments(query);

    res.status(200).json({
      status: 'success',
      data: categories,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Lấy chi tiết danh mục
export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400).json({ status: 'error', message: 'ID không hợp lệ' });
      return;
    }

    const category = await categoryModel
      .findById(req.params.id)
      .populate('parentId', 'name')
      .lean();

    if (!category) {
      res.status(404).json({ status: 'error', message: 'Không tìm thấy danh mục' });
      return;
    }

    res.status(200).json({ status: 'success', data: category });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Tạo danh mục mới
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, img, parentId } = req.body;

    if (!name || name.length > 100) {
      res.status(400).json({
        status: 'error',
        message: 'Tên danh mục là bắt buộc và tối đa 100 ký tự',
      });
      return;
    }

    if (parentId && !mongoose.Types.ObjectId.isValid(parentId)) {
      res.status(400).json({ status: 'error', message: 'parentId không hợp lệ' });
      return;
    }

    if (parentId) {
      const parentExists = await categoryModel.findById(parentId).lean();
      if (!parentExists) {
        res.status(404).json({ status: 'error', message: 'Danh mục cha không tồn tại' });
        return;
      }
    }

    const newCategory = new categoryModel({ name, description, img, parentId: parentId || null });
    const savedCategory = await newCategory.save();

    res.status(201).json({
      status: 'success',
      message: 'Tạo danh mục thành công',
      data: savedCategory,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(409).json({ status: 'error', message: 'Tên danh mục đã tồn tại' });
      return;
    }
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Cập nhật danh mục
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    const { name, description, img, parentId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ status: 'error', message: 'ID không hợp lệ' });
      return;
    }

    if (name && name.length > 100) {
      res.status(400).json({
        status: 'error',
        message: 'Tên danh mục tối đa 100 ký tự',
      });
      return;
    }

    if (parentId && !mongoose.Types.ObjectId.isValid(parentId)) {
      res.status(400).json({ status: 'error', message: 'parentId không hợp lệ' });
      return;
    }

    if (parentId) {
      const parentExists = await categoryModel.findById(parentId).lean();
      if (!parentExists) {
        res.status(404).json({ status: 'error', message: 'Danh mục cha không tồn tại' });
        return;
      }
      if (parentId === id) {
        res.status(400).json({ status: 'error', message: 'Danh mục không thể là cha của chính nó' });
        return;
      }
      const hasCycle = await checkCycle(id, parentId);
      if (hasCycle) {
        res.status(400).json({ status: 'error', message: 'Phát hiện vòng lặp trong phân cấp' });
        return;
      }
    }

    const updateFields: any = { updatedAt: Date.now() };
    if (name !== undefined) updateFields.name = name;
    if (description !== undefined) updateFields.description = description;
    if (img !== undefined) updateFields.img = img;
    if (parentId !== undefined) updateFields.parentId = parentId || null;

    const updatedCategory = await categoryModel.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      res.status(404).json({ status: 'error', message: 'Không tìm thấy danh mục' });
      return;
    }

    res.status(200).json({
      status: 'success',
      message: 'Cập nhật danh mục thành công',
      data: updatedCategory,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(409).json({ status: 'error', message: 'Tên danh mục đã tồn tại' });
      return;
    }
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Xóa danh mục
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ status: 'error', message: 'ID không hợp lệ' });
      return;
    }

    const hasChildren = await categoryModel.findOne({ parentId: id }).lean();
    if (hasChildren) {
      res.status(400).json({ status: 'error', message: 'Không thể xóa danh mục có danh mục con' });
      return;
    }

    const newsCount = await newsModel.countDocuments({ category: id });
    const productCount = await productModel.countDocuments({ category: id });

    if (newsCount > 0 || productCount > 0) {
      res.status(400).json({
        status: 'error',
        message: `Danh mục đang được sử dụng (${newsCount} tin tức, ${productCount} sản phẩm)`,
      });
      return;
    }

    const deletedCategory = await categoryModel.findByIdAndDelete(id);
    if (!deletedCategory) {
      res.status(404).json({ status: 'error', message: 'Không tìm thấy danh mục' });
      return;
    }

    res.status(200).json({ status: 'success', message: 'Xóa danh mục thành công' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Hàm kiểm tra vòng lặp trong phân cấp
const checkCycle = async (categoryId: string, parentId: string): Promise<boolean> => {
  let currentId: string | undefined | null = parentId;
  while (currentId) {
    if (currentId.toString() === categoryId) return true;
    const category = await categoryModel.findById(currentId).lean() as ICategory | null;
    currentId = category?.parentId?.toString() || null;
  }
  return false;
};