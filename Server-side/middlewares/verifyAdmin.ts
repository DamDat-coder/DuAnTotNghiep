import { Request, Response, NextFunction } from "express";
import UserModel from "../models/userModel";

interface AuthRequest extends Request {
  userId?: string;
}

const verifyAdmin = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await UserModel.findById(req.userId);
    if (!user) {
      res.status(404).json({ message: "Không tìm thấy người dùng" });
      return;
    }
    if (user.role !== "admin") {
      res.status(403).json({ message: "Không có quyền truy cập" });
      return;
    }
    next();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export default verifyAdmin;