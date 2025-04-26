import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import newsModel from "../models/newsModel";

// Định nghĩa kiểu cho AuthRequest
interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

// Thêm tin tức
const createNews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, content, category } = req.body;
    if (!title || !content) {
      if (req.file) fs.unlinkSync(req.file.path);
      throw new Error("Tiêu đề và nội dung là bắt buộc");
    }

    const news = new newsModel({
      title,
      content,
      image: req.file ? `/images/${req.file.filename}` : null,
      author: req.userId,
      category,
    });

    const data = await news.save();
    const populatedNews = await newsModel
      .findById(data._id)
      .populate("author", "name email", "users") // Collection name: "users"
      .populate("category", "name description", "categories"); // Collection name: "categories"

    res.status(201).json({ message: "Tạo tin tức thành công", news: populatedNews });
  } catch (error: any) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(400).json({ message: error.message });
  }
};

// Sửa tin tức
const updateNews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, content, category } = req.body;
    const updates: { [key: string]: any } = { updatedAt: Date.now() };

    if (title) updates.title = title;
    if (content) updates.content = content;
    if (category) updates.category = category;
    if (req.file) updates.image = `/images/${req.file.filename}`;

    const news = await newsModel.findById(id);
    if (!news) {
      if (req.file) fs.unlinkSync(req.file.path);
      res.status(404).json({ message: "Không tìm thấy tin tức" });
      return;
    }

    // Xóa ảnh cũ nếu cập nhật ảnh mới
    if (req.file && news.image) {
      const oldImagePath = path.join(__dirname, "../public", news.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    const updatedNews = await newsModel
      .findByIdAndUpdate(id, { $set: updates }, { new: true })
      .populate("author", "name email", "users") // Collection name: "users"
      .populate("category", "name description", "categories"); // Collection name: "categories"

    res.status(200).json({ message: "Cập nhật tin tức thành công", news: updatedNews });
  } catch (error: any) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(400).json({ message: error.message });
  }
};

// Xóa tin tức
const deleteNews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const news = await newsModel.findById(id);
    if (!news) {
      res.status(404).json({ message: "Không tìm thấy tin tức" });
      return;
    }

    // Xóa ảnh nếu có
    if (news.image) {
      const imagePath = path.join(__dirname, "../public", news.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await newsModel.findByIdAndDelete(id);
    res.status(200).json({ message: "Xóa tin tức thành công" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh sách tin tức
const getNewsList = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = "1", limit = "10", category } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const query: { [key: string]: any } = {};
    if (category) {
      query.category = category;
    }

    const news = await newsModel
      .find(query)
      .populate("author", "name email", "users") // Collection name: "users"
      .populate("category", "name description", "categories") // Collection name: "categories"
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await newsModel.countDocuments(query);

    res.status(200).json({
      news,
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum),
      totalNews: total,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy chi tiết tin tức
const getNewsDetail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const news = await newsModel
      .findById(id)
      .populate("author", "name email", "users") // Collection name: "users"
      .populate("category", "name description", "categories"); // Collection name: "categories"
    if (!news) {
      res.status(404).json({ message: "Không tìm thấy tin tức" });
      return;
    }
    res.status(200).json(news);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export { createNews, updateNews, deleteNews, getNewsList, getNewsDetail };