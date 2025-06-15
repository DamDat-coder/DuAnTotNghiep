import { Request, Response } from 'express';
import mongoose from 'mongoose';
import categoryModel, { ICategory } from '../models/categoryModel';
import newsModel from '../models/newsModel';
import productModel from '../models/productModel';

// Get all categories
export const getAllCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const parentId = req.query.parentId as string | null;

    const query = parentId ? { parentId } : { parentId: null };
    const categories = await categoryModel
      .find(query)
      .sort({ createdAt: -1 })
      .populate('parentId', 'name slug')
      .lean();

    const total = await categoryModel.countDocuments(query);

    res.status(200).json({
      status: 'success',
      data: categories,
      total,
      page,
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Get category by ID
export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400).json({ status: 'error', message: 'Invalid category ID' });
      return;
    }

    const category = await categoryModel
      .findById(req.params.id)
      .populate('parentId', 'name slug')
      .lean();

    if (!category) {
      res.status(404).json({ status: 'error', message: 'Category not found' });
      return;
    }

    res.status(200).json({ status: 'success', data: category });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Create a new category
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, slug, parentId, image } = req.body;

    if (!name || !slug) {
      res.status(400).json({ status: 'error', message: 'Name and slug are required' });
      return;
    }

    if (name.length > 100) {
      res.status(400).json({ status: 'error', message: 'Category name must not exceed 100 characters' });
      return;
    }

    if (parentId && !mongoose.Types.ObjectId.isValid(parentId)) {
      res.status(400).json({ status: 'error', message: 'Invalid parentId' });
      return;
    }

    if (parentId) {
      const parentExists = await categoryModel.findById(parentId).lean();
      if (!parentExists) {
        res.status(404).json({ status: 'error', message: 'Parent category not found' });
        return;
      }
    }

    const newCategory = new categoryModel({ name, slug, parentId: parentId || null, image: image || null });
    const savedCategory = await newCategory.save();

    res.status(201).json({
      status: 'success',
      message: 'Category created successfully',
      data: savedCategory,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(409).json({ status: 'error', message: 'Category name or slug already exists' });
      return;
    }
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Update a category
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    const { name, slug, parentId, image } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ status: 'error', message: 'Invalid category ID' });
      return;
    }

    if (name && name.length > 100) {
      res.status(400).json({ status: 'error', message: 'Category name must not exceed 100 characters' });
      return;
    }

    if (parentId && !mongoose.Types.ObjectId.isValid(parentId)) {
      res.status(400).json({ status: 'error', message: 'Invalid parentId' });
      return;
    }

    if (parentId) {
      const parentExists = await categoryModel.findById(parentId).lean();
      if (!parentExists) {
        res.status(404).json({ status: 'error', message: 'Parent category not found' });
        return;
      }
      if (parentId === id) {
        res.status(400).json({ status: 'error', message: 'Category cannot be its own parent' });
        return;
      }
      const hasCycle = await checkCycle(id, parentId);
      if (hasCycle) {
        res.status(400).json({ status: 'error', message: 'Detected cycle in category hierarchy' });
        return;
      }
    }

    const updateFields: Partial<ICategory> = { updatedAt: new Date() };
    if (name !== undefined) updateFields.name = name;
    if (slug !== undefined) updateFields.slug = slug;
    if (parentId !== undefined) updateFields.parentId = parentId || null;
    if (image !== undefined) updateFields.image = image || null;

    const updatedCategory = await categoryModel.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      res.status(404).json({ status: 'error', message: 'Category not found' });
      return;
    }

    res.status(200).json({
      status: 'success',
      message: 'Category updated successfully',
      data: updatedCategory,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(409).json({ status: 'error', message: 'Category name or slug already exists' });
      return;
    }
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Delete a category
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ status: 'error', message: 'Invalid category ID' });
      return;
    }

    const hasChildren = await categoryModel.findOne({ parentId: id }).lean();
    if (hasChildren) {
      res.status(400).json({ status: 'error', message: 'Cannot delete category with subcategories' });
      return;
    }

    const newsCount = await newsModel.countDocuments({ category: id });
    const productCount = await productModel.countDocuments({ category: id });

    if (newsCount > 0 || productCount > 0) {
      res.status(400).json({
        status: 'error',
        message: `Category is in use (${newsCount} news, ${productCount} products)`,
      });
      return;
    }

    const deletedCategory = await categoryModel.findByIdAndDelete(id);
    if (!deletedCategory) {
      res.status(404).json({ status: 'error', message: 'Category not found' });
      return;
    }

    res.status(200).json({ status: 'success', message: 'Category deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Check for cycles in category hierarchy
const checkCycle = async (categoryId: string, parentId: string): Promise<boolean> => {
  let currentId: string | undefined | null = parentId;
  while (currentId) {
    if (currentId.toString() === categoryId) return true;
    const category = await categoryModel.findById(currentId).lean() as ICategory | null;
    currentId = category?.parentId?.toString() || null;
  }
  return false;
};