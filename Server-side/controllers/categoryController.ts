import { Request, Response } from "express";
import mongoose from "mongoose";
import categoryModel, { ICategory } from "../models/categoryModel";
import newsModel from "../models/newsModel";
import productModel from "../models/productModel";
import cloudinary from "../config/cloudinary"; 

// Lấy danh sách tất cả danh mục (có thể lọc theo parentId)
export const getAllCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const parentId = req.query.parentId as string | null;

    const query = parentId && mongoose.Types.ObjectId.isValid(parentId)
      ? { parentId }
      : { parentId: null };

    const categories = await categoryModel
      .find(query)
      .sort({ createdAt: -1 })
      .populate("parentId", "name slug")
      .lean();

    const total = await categoryModel.countDocuments(query);

    res.status(200).json({
      status: "success",
      data: categories,
      total,
      page,
    });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Lấy thông tin danh mục theo ID
export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ status: "error", message: "ID danh mục không hợp lệ" });
      return;
    }

    const category = await categoryModel
      .findById(id)
      .populate("parentId", "name slug")
      .lean();

    if (!category) {
      res.status(404).json({ status: "error", message: "Không tìm thấy danh mục" });
      return;
    }

    res.status(200).json({ status: "success", data: category });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Tạo danh mục mới
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, slug, parentId, image } = req.body;

    if (!name || !slug) {
      res.status(400).json({ status: "error", message: "Tên và slug là bắt buộc" });
      return;
    }

    if (parentId && !mongoose.Types.ObjectId.isValid(parentId)) {
      res.status(400).json({ status: "error", message: "ID danh mục cha không hợp lệ" });
      return;
    }

    if (parentId) {
      const parentExists = await categoryModel.findById(parentId).lean();
      if (!parentExists) {
        res.status(404).json({ status: "error", message: "Danh mục cha không tồn tại" });
        return;
      }
    }

    // Kiểm tra image URL (nếu có)
    if (image && !isValidUrl(image)) {
      res.status(400).json({ status: "error", message: "URL hình ảnh không hợp lệ" });
      return;
    }

    const newCategory = new categoryModel({
      name,
      slug,
      parentId: parentId || null,
      image: image || null,
    });

    const savedCategory = await newCategory.save();

    res.status(201).json({
      status: "success",
      message: "Tạo danh mục thành công",
      data: savedCategory,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      res.status(409).json({ status: "error", message: `Danh mục với ${field} đã tồn tại` });
      return;
    }
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Cập nhật danh mục
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    const { name, slug, parentId, image } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ status: "error", message: "ID danh mục không hợp lệ" });
      return;
    }

    if (parentId && parentId !== null && !mongoose.Types.ObjectId.isValid(parentId)) {
      res.status(400).json({ status: "error", message: "ID danh mục cha không hợp lệ" });
      return;
    }

    if (parentId) {
      const parentExists = await categoryModel.findById(parentId).lean();
      if (!parentExists) {
        res.status(404).json({ status: "error", message: "Không tìm thấy danh mục cha" });
        return;
      }

      if (parentId === id) {
        res.status(400).json({ status: "error", message: "Không thể chọn chính nó làm danh mục cha" });
        return;
      }

      const hasCycle = await checkCycle(id, parentId);
      if (hasCycle) {
        res.status(400).json({ status: "error", message: "Phát hiện vòng lặp trong cây danh mục" });
        return;
      }
    }

    const updateFields: Partial<ICategory> = { updatedAt: new Date() };
    if (name !== undefined) updateFields.name = name;
    if (slug !== undefined) updateFields.slug = slug;
    if (parentId !== undefined) updateFields.parentId = parentId || null;

    // Xử lý hình ảnh
    if (image !== undefined) {
      if (image && !isValidUrl(image)) {
        res.status(400).json({ status: "error", message: "URL hình ảnh không hợp lệ" });
        return;
      }
      // Xóa hình ảnh cũ trên Cloudinary nếu có
      if (image) {
        const currentCategory = await categoryModel.findById(id).lean();
        if (currentCategory?.image) {
          const publicId = extractPublicId(currentCategory.image);
          await cloudinary.uploader.destroy(publicId);
        }
      }
      updateFields.image = image || null;
    }

    const updatedCategory = await categoryModel.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      res.status(404).json({ status: "error", message: "Không tìm thấy danh mục để cập nhật" });
      return;
    }

    res.status(200).json({
      status: "success",
      message: "Cập nhật danh mục thành công",
      data: updatedCategory,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      res.status(409).json({ status: "error", message: `Danh mục với ${field} đã tồn tại` });
      return;
    }
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Xóa danh mục
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const categoryId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      res.status(400).json({ status: "error", message: "ID danh mục không hợp lệ" });
      return;
    }

    const hasChild = await categoryModel.findOne({ parentId: categoryId }).lean();
    if (hasChild) {
      res.status(400).json({ status: "error", message: "Không thể xóa danh mục có danh mục con" });
      return;
    }

    const newsCount = await newsModel.countDocuments({ category: categoryId });
    const productCount = await productModel.countDocuments({ category: categoryId });

    if (newsCount > 0 || productCount > 0) {
      res.status(400).json({
        status: "error",
        message: `Không thể xóa danh mục đang được sử dụng (${newsCount} tin tức, ${productCount} sản phẩm)`
      });
      return;
    }

    // Xóa hình ảnh trên Cloudinary nếu có
    const category = await categoryModel.findById(categoryId).lean();
    if (category?.image) {
      const publicId = extractPublicId(category.image);
      await cloudinary.uploader.destroy(publicId);
    }

    const deletedCategory = await categoryModel.findByIdAndDelete(categoryId);
    if (!deletedCategory) {
      res.status(404).json({ status: "error", message: "Không tìm thấy danh mục để xóa" });
      return;
    }

    res.status(200).json({ status: "success", message: "Xóa danh mục thành công" });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Hàm kiểm tra vòng lặp trong cây danh mục
const checkCycle = async (categoryId: string, parentId: string): Promise<boolean> => {
  const visited = new Set<string>();
  let currentId: string | undefined | null = parentId;

  while (currentId && !visited.has(currentId)) {
    if (currentId === categoryId) {
      return true;
    }
    visited.add(currentId);
    const category = await categoryModel.findById(currentId).lean() as ICategory | null;
    currentId = category?.parentId?.toString() || null;
  }

  return false;
};

// Hàm kiểm tra URL hợp lệ
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return url.startsWith("https://res.cloudinary.com");
  } catch {
    return false;
  }
};

// Hàm trích xuất public_id từ URL Cloudinary
const extractPublicId = (url: string): string => {
  const parts = url.split("/");
  const fileName = parts.pop()?.split(".")[0];
  const folder = parts.slice(parts.indexOf("categories"));
  return [...folder, fileName].join("/");
};