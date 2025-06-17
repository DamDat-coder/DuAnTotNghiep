import { Request, Response } from "express";
import mongoose from "mongoose";
import newsModel, { INews } from "../models/newsModel";
import { uploadImageToCloudinary, uploadMultipleImagesToCloudinary, deleteImageFromCloudinary } from "../utils/cloudinaryUpload";

// Thêm tin tức
const createNews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, content, category_id, slug, tags, thumbnail, news_image, user_id } = req.body;

    if (!title || !content || !category_id || !slug || !user_id) {
      throw new Error("Tiêu đề, nội dung, danh mục, slug và người tạo là bắt buộc");
    }

    if (!mongoose.Types.ObjectId.isValid(user_id) || !mongoose.Types.ObjectId.isValid(category_id)) {
      throw new Error("user_id hoặc category_id không hợp lệ");
    }

    const thumbnailResult = thumbnail ? await uploadImageToCloudinary(thumbnail) : null;
    const imageList = Array.isArray(news_image) ? news_image : [];
    const uploadedImages = imageList.length > 0 ? await uploadMultipleImagesToCloudinary(imageList) : [];

    const news = new newsModel({
      title,
      content,
      slug,
      thumbnail: thumbnailResult?.secure_url || null,
      user_id,
      category_id,
      tags: tags || [],
      news_image: uploadedImages,
      is_published: false,
    });

    const data = await news.save();
    const populatedNews = await newsModel
      .findById(data._id)
      .populate("user_id", "name email")
      .populate("category_id", "name");

    res.status(201).json({ message: "Tạo tin tức thành công", news: populatedNews });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ message: "Slug đã tồn tại" });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
};

// Cập nhật tin tức
const updateNews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, content, category_id, slug, tags, thumbnail, news_image, is_published } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "ID tin tức không hợp lệ" });
      return;
    }

    const news = await newsModel.findById(id);
    if (!news) {
      res.status(404).json({ message: "Không tìm thấy tin tức" });
      return;
    }

    const updates: Partial<INews> = {};

    if (title) updates.title = title;
    if (content) updates.content = content;
    if (slug) updates.slug = slug;
    if (tags) updates.tags = tags;
    if (typeof is_published === "boolean") {
      updates.is_published = is_published;
      updates.published_at = is_published ? new Date() : null;
    }
    if (category_id) {
      if (!mongoose.Types.ObjectId.isValid(category_id)) {
        throw new Error("category_id không hợp lệ");
      }
      updates.category_id = new mongoose.Types.ObjectId(category_id);
    }

    if (thumbnail) {
      if (news.thumbnail) await deleteImageFromCloudinary(news.thumbnail);
      const thumbnailResult = await uploadImageToCloudinary(thumbnail);
      updates.thumbnail = thumbnailResult.secure_url;
    }

    if (Array.isArray(news_image) && news_image.length > 0) {
      for (const img of news.news_image || []) {
        await deleteImageFromCloudinary(img);
      }
      const uploadedImages = await uploadMultipleImagesToCloudinary(news_image);
      updates.news_image = uploadedImages;
    }

    const updatedNews = await newsModel
      .findByIdAndUpdate(id, { $set: updates }, { new: true })
      .populate("user_id", "name email")
      .populate("category_id", "name");

    res.status(200).json({ message: "Cập nhật tin tức thành công", news: updatedNews });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ message: "Slug đã tồn tại" });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
};

// Xoá tin tức
const deleteNews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "ID tin tức không hợp lệ" });
      return;
    }

    const news = await newsModel.findById(id);
    if (!news) {
      res.status(404).json({ message: "Không tìm thấy tin tức" });
      return;
    }

    if (news.thumbnail) await deleteImageFromCloudinary(news.thumbnail);
    for (const img of news.news_image || []) {
      await deleteImageFromCloudinary(img);
    }

    await newsModel.findByIdAndDelete(id);
    res.status(200).json({ message: "Xoá tin tức thành công" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh sách tin tức
const getNewsList = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = "1", limit = "10", category_id } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const query: any = {};
    if (category_id) {
      if (!mongoose.Types.ObjectId.isValid(category_id as string)) {
        throw new Error("category_id không hợp lệ");
      }
      query.category_id = category_id;
    }

    const news = await newsModel
      .find(query)
      .populate("user_id", "name email")
      .populate("category_id", "name")
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "ID tin tức không hợp lệ" });
      return;
    }

    const news = await newsModel
      .findById(id)
      .populate("user_id", "name email")
      .populate("category_id", "name");

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