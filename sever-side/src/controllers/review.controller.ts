import { Request, Response } from "express";
import ReviewModel from "../models/review.model";
import OrderModel from "../models/order.model";
import UserModel from "../models/user.model";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import mongoose from "mongoose";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { SPAM_KEYWORDS } from "../config/spam-keywords";
import { sendReviewWarningEmail, sendAccountBlockedEmail } from "../utils/mailer";

// Tạo đánh giá sản phẩm
export const createReview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { productId, orderId, content, rating } = req.body;

    if (!userId || !productId || !orderId || !content || !rating) {
      return res.status(400).json({ success: false, message: "Thiếu thông tin review." });
    }

    if (!mongoose.Types.ObjectId.isValid(productId) || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: "ID không hợp lệ." });
    }

    const order = await OrderModel.findOne({
      _id: new mongoose.Types.ObjectId(orderId),
      userId,
      status: "delivered",
      "items.productId": new mongoose.Types.ObjectId(productId),
    });

    if (!order) {
      return res.status(403).json({
        success: false,
        message: "Bạn chỉ có thể đánh giá sản phẩm trong đơn hàng đã giao.",
      });
    }

    const existingReview = await ReviewModel.findOne({ userId, productId, orderId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "Bạn đã đánh giá sản phẩm này trong đơn hàng này rồi.",
      });
    }

    const imageUrls: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files as Express.Multer.File[]) {
        const result = await new Promise<UploadApiResponse>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: "image", folder: "reviews" },
            (error, result) => {
              if (error || !result) return reject(error);
              resolve(result);
            }
          );
          stream.end(file.buffer);
        });
        imageUrls.push(result.secure_url);
      }
    }

    const isSpam = SPAM_KEYWORDS.some(keyword =>
      content.toLowerCase().includes(keyword.toLowerCase())
    );

    let reviewStatus: "approved" | "spam" = isSpam ? "spam" : "approved";
    let spamWarningMessage = "";

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "Không tìm thấy người dùng." });
    }

    if (isSpam) {
      const existingSpamCount = await ReviewModel.countDocuments({ userId, status: "spam" });
      const spamCountAfterThis = existingSpamCount + 1;

      if (spamCountAfterThis >= 3) {
        await UserModel.findByIdAndUpdate(userId, { is_active: false });
        await sendAccountBlockedEmail(user.email, user.name || "Người dùng");
        spamWarningMessage = "Tài khoản đã bị khóa vì có quá nhiều đánh giá spam.";
      } else {
        await sendReviewWarningEmail(user.email, user.name || "Người dùng");
        spamWarningMessage = `Đánh giá bị đánh dấu là spam. Đây là lần thứ ${spamCountAfterThis}. Nếu tiếp tục, tài khoản sẽ bị khóa.`;
      }
    }

    // Tạo đánh giá
    const newReview = await ReviewModel.create({
      userId,
      productId,
      orderId,
      content,
      rating,
      status: reviewStatus,
      images: imageUrls,
    });

    return res.status(201).json({
      success: true,
      message: "Đã gửi đánh giá.",
      data: newReview,
      ...(spamWarningMessage && { warning: spamWarningMessage }),
    });
  } catch (error) {
    console.error("Lỗi tạo review:", error);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
};

// Lấy đánh giá của sản phẩm
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

// Lấy tất cả đánh giá
export const getAllReviews = async (req: Request, res: Response) => {
  try {
    const { page = "1", limit = "10", search, status } = req.query;

    const pageNum = Math.max(parseInt(page as string), 1);
    const limitNum = Math.max(parseInt(limit as string), 1);
    const skip = (pageNum - 1) * limitNum;

    const query: any = {};

    if (status && (status === "approved" || status === "spam")) {
      query.status = status;
    }
    if (search) {
      query.content = { $regex: search as string, $options: "i" };
    }

    const [reviews, total] = await Promise.all([
      ReviewModel.find(query)
        .populate("userId", "name email")
        .populate("productId", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      ReviewModel.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: reviews,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy tất cả đánh giá:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi máy chủ.",
      error: (error as Error).message,
    });
  }
};

// Cập nhật trạng thái đánh giá
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