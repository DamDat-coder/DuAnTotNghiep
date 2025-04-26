import { Request, Response, NextFunction } from "express";
import newsModel from "../models/newsModel";

interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

const verifyNewsAccess = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const news = await newsModel.findById(id);
    if (!news) {
      res.status(404).json({ message: "Không tìm thấy tin tức" });
      return;
    }

    // Members can only edit/delete their own news; admins can edit/delete any news
    if (req.userRole === "member" && news.author.toString() !== req.userId) {
      res.status(403).json({ message: "Chỉ được chỉnh sửa hoặc xóa tin tức của chính bạn" });
      return;
    }

    next();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export default verifyNewsAccess;