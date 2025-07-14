import { Request, Response } from "express";
import mongoose from "mongoose";
import newsModel, { INews } from "../models/news.model";
import UserModel from "../models/user.model";
import NotificationModel from "../models/notification.model";
import { v2 as cloudinary } from "cloudinary";
import {
  MulterRequest,
  normalizeFiles,
} from "../middlewares/upload.middleware";

// Thêm tin tức
export const createNews = async (
  req: MulterRequest,
  res: Response
): Promise<void> => {
  try {
    const { title, content, slug, category_id, tags, meta_description } =
      req.body;
    const user_id = req.user?.userId;

    if (!title || !content || !slug || !category_id || !user_id) {
      res.status(400).json({
        status: "error",
        message: "Thiếu trường bắt buộc: title, content, slug, category_id",
      });
      return;
    }

    if (
      !mongoose.Types.ObjectId.isValid(user_id) ||
      !mongoose.Types.ObjectId.isValid(category_id)
    ) {
      res.status(400).json({
        status: "error",
        message: "user_id hoặc category_id không hợp lệ",
      });
      return;
    }

    const files = normalizeFiles(req.files);
    let thumbnail: string | null = null;

    if (files.length > 0) {
      const result = await new Promise<string>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "news" },
          (error, result) => {
            if (error || !result) return reject(error);
            resolve(result.secure_url);
          }
        );
        stream.end(files[0].buffer);
      });

      thumbnail = result;
    }

    const newsData: Partial<INews> = {
      title,
      content,
      slug,
      category_id: new mongoose.Types.ObjectId(category_id),
      user_id: new mongoose.Types.ObjectId(user_id),
      tags: tags ? tags.split(",") : [],
      thumbnail,
      meta_description,
      is_published: false,
    };

    const createdNews = new newsModel(newsData);
    const savedNews = await createdNews.save();

    const populated = await newsModel
      .findById(savedNews._id)
      .populate("user_id", "name email")
      .populate("category_id", "name");

    // Gửi thông báo
    setImmediate(async () => {
      try {
        const users = await UserModel.find({}).select("_id").lean();
        const notifications = users.map((user: { _id: string }) => ({
          userId: user._id,
          title: "Tin tức mới từ Shop4Real!",
          message: `Tin tức "${savedNews.title}" vừa được đăng, xem ngay nhé!`,
          type: "news",
          isRead: false,
          link: `/posts/${savedNews._id}`,
        }));
        await NotificationModel.insertMany(notifications);
        console.log("Đã gửi thông báo tin tức mới cho người dùng.");
      } catch (notifyErr) {
        console.error("Gửi thông báo thất bại:", notifyErr);
      }
    });

    res.status(201).json({
      status: "success",
      message: "Tạo tin tức thành công",
      data: populated,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(409).json({ status: "error", message: "Slug đã tồn tại" });
    } else {
      res.status(500).json({ status: "error", message: error.message });
    }
  }
};

// Cập nhật tin tức
export const updateNews = async (
  req: MulterRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      title,
      content,
      slug,
      category_id,
      tags,
      is_published,
      meta_description,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res
        .status(400)
        .json({ status: "error", message: "ID tin tức không hợp lệ" });
      return;
    }

    const existingNews = await newsModel.findById(id);
    if (!existingNews) {
      res
        .status(404)
        .json({ status: "error", message: "Tin tức không tồn tại" });
      return;
    }

    const updates: Partial<INews> = {};
    if (title) updates.title = title;
    if (content) updates.content = content;
    if (slug) updates.slug = slug;
    if (tags) updates.tags = tags.split(",");
    if (meta_description) updates.meta_description = meta_description;

    if (
      typeof is_published === "boolean" ||
      is_published === "true" ||
      is_published === "false"
    ) {
      const publishStatus = is_published === true || is_published === "true";
      updates.is_published = publishStatus;
      updates.published_at = publishStatus ? new Date() : null;
    }

    if (category_id && mongoose.Types.ObjectId.isValid(category_id)) {
      updates.category_id = new mongoose.Types.ObjectId(category_id);
    }

    const files = normalizeFiles(req.files);
    if (files.length > 0) {
      const result = await new Promise<string>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "news" },
          (error, result) => {
            if (error || !result) return reject(error);
            resolve(result.secure_url);
          }
        );
        stream.end(files[0].buffer);
      });

      updates.thumbnail = result;
    }

    const updatedNews = await newsModel
      .findByIdAndUpdate(id, { $set: updates }, { new: true })
      .populate("user_id", "name email")
      .populate("category_id", "name");

    res.status(200).json({
      status: "success",
      message: "Cập nhật thành công",
      data: updatedNews,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(409).json({ status: "error", message: "Slug đã tồn tại" });
    } else {
      res.status(500).json({ status: "error", message: error.message });
    }
  }
};

// Xoá tin tức
export const deleteNews = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res
        .status(400)
        .json({ status: "error", message: "ID tin tức không hợp lệ" });
      return;
    }

    await newsModel.findByIdAndDelete(id);
    res
      .status(200)
      .json({ status: "success", message: "Xóa tin tức thành công" });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Lấy danh sách tin tức
export const getNewsList = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      page = "1",
      limit = "10",
      category_id,
      isPublished,
      search,
    } = req.query;

    const pageNum = Math.max(parseInt(page as string), 1);
    const limitNum = Math.max(parseInt(limit as string), 1);
    const skip = (pageNum - 1) * limitNum;
    const query: any = {};

    if (category_id && mongoose.Types.ObjectId.isValid(category_id as string)) {
      query.category_id = category_id;
    }

    if (isPublished !== undefined) {
      query.is_published = isPublished === "true";
    }

    if (search) {
      query.title = { $regex: search as string, $options: "i" };
    }

    const [news, total] = await Promise.all([
      newsModel
        .find(query)
        .populate("user_id", "name email")
        .populate("category_id", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      newsModel.countDocuments(query),
    ]);

    res.status(200).json({
      status: "success",
      data: news,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message || "Lỗi server",
    });
  }
};

// Lấy chi tiết tin tức
export const getNewsDetail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res
        .status(400)
        .json({ status: "error", message: "ID tin tức không hợp lệ" });
      return;
    }

    const news = await newsModel
      .findById(id)
      .populate("user_id", "name email")
      .populate("category_id", "name");

    if (!news) {
      res
        .status(404)
        .json({ status: "error", message: "Không tìm thấy tin tức" });
      return;
    }

    res.status(200).json({ status: "success", data: news });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
