// controllers/userController.ts
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserModel, { IUser } from "../models/userModel";
import RefreshTokenModel from "../models/refreshTokenModel";
import dotenv from "dotenv";
dotenv.config();

// Đăng ký
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, addresses = [], phone } = req.body;

    if (!email || !password || !name) {
      res
        .status(400)
        .json({ message: "Email, mật khẩu và họ tên là bắt buộc." });
      return;
    }

    const existingUser = await UserModel.findOne({
      $or: [{ email }, ...(phone ? [{ phone }] : [])],
    });

    if (existingUser) {
      res.status(409).json({ message: "Email hoặc số điện thoại đã tồn tại." });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await UserModel.create({
      email,
      password: hashedPassword,
      name,
      addresses,
      phone: phone || null,
    });

    const accessToken = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    const refreshToken = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET!,
      { expiresIn: "30d" }
    );

    await RefreshTokenModel.create({
      userId: newUser._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: "/", // Đảm bảo cookie áp dụng cho toàn bộ domain
    });

    res.status(201).json({
      message: "Đăng ký thành công.",
      accessToken,
      user: {
        _id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        phone: newUser.phone,
        role: newUser.role,
        is_active: newUser.is_active,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Đã xảy ra lỗi máy chủ." });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        message: "Vui lòng nhập email hoặc số điện thoại và mật khẩu.",
      });
      return;
    }

    let user: IUser | null;

    // Kiểm tra nếu là số => tìm theo phone
    if (/^\d+$/.test(email)) {
      user = await UserModel.findOne({ phone: Number(email) });
    } else {
      // Ngược lại tìm theo email
      user = await UserModel.findOne({ email });
    }

    if (!user) {
      res.status(401).json({ message: "Tài khoản không tồn tại." });
      return;
    }

    // Kiểm tra trạng thái tài khoản
    if (!user.is_active) {
      res.status(403).json({ message: "Tài khoản đã bị khóa." });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Mật khẩu không đúng." });
      return;
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET chưa được cấu hình.");
    }

    // Tạo access token
    const accessToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    // Xóa refresh token cũ
    await RefreshTokenModel.deleteMany({ userId: user._id });

    // Lưu refresh token mới
    await RefreshTokenModel.create({
      userId: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    // Thiết lập cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
      /* options */
    });

    res.status(200).json({
      message: "Đăng nhập thành công.",
      accessToken, // Trả về access token
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Đã xảy ra lỗi máy chủ." });
  }
};

// Làm mới token
export const refresh = async (req: Request, res: Response): Promise<void> => {
  const refreshToken = req.cookies.refreshToken;
  console.log("Received refresh token:", refreshToken);
  if (!refreshToken) {
    res.status(400).json({ message: "Thiếu Refresh Token" });
    return;
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || "default_secret";
    const decoded = jwt.verify(refreshToken, jwtSecret) as { id: string };

    const tokenDoc = await RefreshTokenModel.findOne({
      userId: decoded.id,
      token: refreshToken,
    });

    if (!tokenDoc) {
      res.status(401).json({ message: "Refresh Token không hợp lệ" });
      return;
    }

    const accessToken = jwt.sign({ id: decoded.id }, jwtSecret, {
      expiresIn: "1h",
    });
    res.json({ accessToken, message: "Làm mới token thành công" });
  } catch (error: any) {
    res.status(401).json({
      message:
        error.name === "TokenExpiredError"
          ? "Refresh Token đã hết hạn"
          : "Refresh Token không hợp lệ",
    });
  }
};

// Lấy thông tin cá nhân
export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const user = await UserModel.findById(userId).select("-password");

    if (!user) {
      res.status(404).json({ message: "Không tìm thấy người dùng." });
      return;
    }

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy tất cả người dùng (admin)
export const getAllUser = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await UserModel.find().select("-password");
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật thông tin người dùng
export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const requesterId = (req as any).userId;
    const requesterRole = (req as any).role;

    const { name, addresses, phone, password, is_active, userId } = req.body;
    const targetUserId =
      requesterRole === "admin" && userId ? userId : requesterId;

    const updates: Partial<IUser> = {};

    if (name) updates.name = name;
    if (addresses) updates.addresses = addresses;

    if (phone) {
      const daTonTai = await UserModel.findOne({
        phone,
        _id: { $ne: targetUserId },
      });
      if (daTonTai) {
        res.status(409).json({ message: "Số điện thoại đã được sử dụng." });
        return;
      }
      updates.phone = phone;
    }

    if (password) {
      if (password.length < 6) {
        res.status(400).json({ message: "Mật khẩu phải có ít nhất 6 ký tự." });
        return;
      }
      updates.password = await bcrypt.hash(password, 10);
    }

    if (requesterRole === "admin" && typeof is_active === "boolean") {
      updates.is_active = is_active;
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      targetUserId,
      { $set: updates },
      { new: true, select: "-password" }
    );

    if (!updatedUser) {
      res.status(404).json({ message: "Không tìm thấy người dùng." });
      return;
    }

    res.json({ message: "Cập nhật thông tin thành công.", user: updatedUser });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Khóa tài khoản
export const disableUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const user = await UserModel.findById(userId);

    if (!user) {
      res.status(404).json({ message: "Không tìm thấy người dùng." });
      return;
    }

    if (user.role === "admin") {
      res.status(403).json({ message: "Không thể khóa tài khoản admin." });
      return;
    }

    user.is_active = false;
    await user.save();

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    res.json({ message: "Tài khoản đã bị khóa thành công." });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
