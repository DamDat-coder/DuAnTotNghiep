import { Request, Response } from "express";
import ReviewModel from "../models/review.model";
import OrderModel from "../models/order.model";
import UserModel from "../models/user.model";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import mongoose from "mongoose";

const SPAM_KEYWORDS = ["xxx", "lừa đảo", "quảng cáo", "viagra", "hack", "free tiền"];
export const createReview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { productId, content, rating } = req.body;

    if (!userId || !productId || !content || !rating) {
      return res.status(400).json({ success: false, message: "Thiếu thông tin review." });
    }

    const order = await OrderModel.findOne({
      userId: userId,
      status: "delivered",
      "items.productId": new mongoose.Types.ObjectId(productId),
    });

    if (!order) {
      return res.status(403).json({
        success: false,
        message: "Bạn chỉ có thể đánh giá khi đã mua và nhận hàng sản phẩm này.",
      });
    }

    const existingReview = await ReviewModel.findOne({ userId, productId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "Bạn đã đánh giá sản phẩm này rồi.",
      });
    }

    let isSpam = false;
    for (const keyword of SPAM_KEYWORDS) {
      if (content.toLowerCase().includes(keyword.toLowerCase())) {
        isSpam = true;
        break;
      }
    }

    let status: "approved" | "spam" = "approved";
    let warning = "";

    if (isSpam) {
      status = "spam";

      // Đếm số review đã bị spam trước đó
      const spamCount = await ReviewModel.countDocuments({
        userId,
        status: "spam",
      });

      const totalSpam = spamCount + 1; // tính cả review hiện tại

      if (totalSpam === 2) {
        warning = "⚠️ Bạn đã bị đánh dấu spam 2 lần. Nếu tiếp tục, tài khoản sẽ bị khóa.";
      } else if (totalSpam >= 3) {
        await UserModel.findByIdAndUpdate(userId, { is_active: false });
        warning = "🚫 Tài khoản đã bị khóa vì spam quá nhiều.";
      }
    }

    const review = await ReviewModel.create({
      userId,
      productId,
      content,
      rating,
      status,
    });

    return res.status(201).json({
      success: true,
      message: "Đã gửi đánh giá.",
      data: review,
      ...(warning && { warning }),
    });
  } catch (error) {
    console.error("Lỗi tạo review:", error);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
};
export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const productId = req.params.productId;
    const reviews = await ReviewModel.find({
      productId,
      status: "approved",
    })
      .populate("userId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    console.error("Lỗi khi lấy đánh giá:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
};

export const getAllReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await ReviewModel.find()
      .populate("userId", "name email")
      .populate("productId", "name");

    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    console.error("Lỗi khi lấy tất cả đánh giá:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
};

export const updateReviewStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "spam"].includes(status)) {
      return res.status(400).json({ success: false, message: "Trạng thái không hợp lệ." });
    }

    const updated = await ReviewModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đánh giá." });
    }

    res.status(200).json({ success: true, message: "Cập nhật trạng thái thành công.", data: updated });
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái đánh giá:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
};
