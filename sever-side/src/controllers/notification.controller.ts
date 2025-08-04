import { Request, Response } from "express";
import NotificationModel from "../models/notification.model";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

// Lấy thông báo của người dùng hiện tại
export const getMyNotifications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    const notifications = await NotificationModel.find({
      $or: [{ userId }, { userId: null }],
    })
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    console.error("Lỗi lấy thông báo:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
};

// Đánh dấu là đã đọc
export const markNotificationAsRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user?.userId;

    const updated = await NotificationModel.findOneAndUpdate(
      { _id: notificationId, userId },
      { is_read: true },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Không tìm thấy thông báo." });
    }

    res.status(200).json({ success: true, message: "Đã đánh dấu là đã đọc.", data: updated });
  } catch (error) {
    console.error("Lỗi đánh dấu đọc:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
};

//