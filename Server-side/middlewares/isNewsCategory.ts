import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import categoryModel from "../models/categoryModel";
import fs from "fs";

interface NewsCategoryRequestBody {
  category: string;
}

interface NewsCategoryRequest extends Request {
  body: NewsCategoryRequestBody;
}

const isNewsCategoryMiddleware = async (
  req: NewsCategoryRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { category } = req.body;

    if (!category) {
      res.status(400).json({ message: "Danh mục là bắt buộc" });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(category)) {
      if (req.file) fs.unlinkSync(req.file.path);
      res.status(400).json({ message: "ID danh mục không hợp lệ" });
      return;
    }

    const categoryExists = await categoryModel.findById(category);
    if (!categoryExists) {
      if (req.file) fs.unlinkSync(req.file.path);
      res.status(400).json({ message: "Danh mục không tồn tại" });
      return;
    }

    const newsRoot = await categoryModel.findOne({ name: "News", parentId: null }).lean();
    if (!newsRoot) {
      if (req.file) fs.unlinkSync(req.file.path);
      res.status(400).json({ message: "Danh mục gốc News chưa được tạo" });
      return;
    }

    const isValidNewsCategory = await isNewsCategory(category, newsRoot._id.toString());
    if (!isValidNewsCategory) {
      if (req.file) fs.unlinkSync(req.file.path);
      res.status(400).json({ message: "Danh mục không thuộc nhánh News" });
      return;
    }

    next();
  } catch (error: any) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(400).json({ message: error.message });
  }
};

const isNewsCategory = async (categoryId: string, newsRootId: string): Promise<boolean> => {
  let currentId: string | null = categoryId;
  while (currentId) {
    const category = await categoryModel.findById(currentId).lean() as unknown; // Chuyển đổi thành unknown trước
    if (!category || !(category as { _id: string; parentId?: string })._id) return false;


    if ((category as { _id: string })._id.toString() === newsRootId) return true;

    currentId = (category as { parentId?: string }).parentId?.toString() || null;
  }
  return false;
};



export { isNewsCategoryMiddleware, isNewsCategory };