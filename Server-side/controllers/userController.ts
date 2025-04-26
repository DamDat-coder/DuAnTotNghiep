import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import UserModel, { IUser } from "../models/userModel";
import RefreshTokenModel from "../models/refreshTokenModel";

// Load environment variables
dotenv.config();

// Định nghĩa kiểu cho AuthRequest để thêm userId
interface AuthRequest extends Request {
  userId?: string;
}

// Đăng ký
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, address, phone } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!email || !password || !name) {
      throw new Error("Email, mật khẩu và tên là bắt buộc");
    }
    if (password.length < 6) {
      throw new Error("Mật khẩu phải dài ít nhất 6 ký tự");
    }

    // Kiểm tra email đã tồn tại
    const checkEmail = await UserModel.findOne({ email });
    if (checkEmail) {
      res.status(409).json({ message: "Email đã tồn tại" });
      return;
    }

    // Kiểm tra số điện thoại đã tồn tại (nếu có)
    if (phone) {
      const checkPhone = await UserModel.findOne({ phone });
      if (checkPhone) {
        res.status(409).json({ message: "Số điện thoại đã tồn tại" });
        return;
      }
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo người dùng mới
    const newUser = new UserModel({
      email,
      password: hashedPassword,
      name,
      address: address || null,
      phone: phone || null,
      avatar: req.file ? `/images/${req.file.filename}` : null,
      role: "user",
    });

    const data = await newUser.save();
    const { password: _, ...userData } = data.toObject();

    // Tạo JWT tokens
    const jwtSecret = process.env.JWT_SECRET || "default_secret";
    const accessToken = jwt.sign({ id: data._id }, jwtSecret, { expiresIn: "1h" });
    const refreshToken = jwt.sign({ id: data._id }, jwtSecret, { expiresIn: "30d" });

    // Lưu refresh token vào database
    await RefreshTokenModel.create({
      userId: data._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    // Thiết lập cookie cho refresh token
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ message: "Đăng ký thành công", accessToken, user: userData });
  } catch (error: any) {
    // Xóa file ảnh nếu có lỗi
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(400).json({ message: error.message });
  }
};

// Đăng nhập
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier, password } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!identifier || !password) {
      res.status(400).json({
        message: "Vui lòng cung cấp email hoặc số điện thoại và mật khẩu",
      });
      return;
    }

    // Tìm người dùng theo email hoặc số điện thoại
    const user = await UserModel.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });

    if (!user) {
      res.status(404).json({ message: "Email hoặc số điện thoại không tồn tại" });
      return;
    }

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: "Mật khẩu không đúng" });
      return;
    }

    // Tạo JWT tokens
    const jwtSecret = process.env.JWT_SECRET || "default_secret";
    const accessToken = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: "1h" });
    const refreshToken = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: "30d" });

    // Lưu refresh token vào database
    await RefreshTokenModel.create({
      userId: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    // Thiết lập cookie cho refresh token
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    const { password: _, ...userData } = user.toObject();
    res.json({ message: "Đăng nhập thành công", accessToken, user: userData });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Làm mới token
export const refresh = async (req: Request, res: Response): Promise<void> => {
  const refreshToken = req.cookies.refreshToken;

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

    const accessToken = jwt.sign({ id: decoded.id }, jwtSecret, { expiresIn: "1h" });
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

// Lấy thông tin user
export const getUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await UserModel.findById(req.userId).select("-password");
    if (!user) {
      res.status(404).json({ message: "Không tìm thấy người dùng" });
      return;
    }
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy tất cả user
export const getAllUser = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await UserModel.find().select("-password");
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật thông tin người dùng
export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, address, phone, password } = req.body;
    const updates: Partial<IUser> = {};

    if (name) updates.name = name;
    if (address) updates.address = address;

    if (phone) {
      const checkPhone = await UserModel.findOne({ phone, _id: { $ne: req.userId } });
      if (checkPhone) {
        res.status(409).json({ message: "Số điện thoại đã được sử dụng" });
        return;
      }
      updates.phone = phone;
    }

    if (req.file) updates.avatar = `/images/${req.file.filename}`;
    if (password) {
      if (password.length < 6) {
        throw new Error("Mật khẩu mới phải dài ít nhất 6 ký tự");
      }
      updates.password = await bcrypt.hash(password, 10);
    }

    const user = await UserModel.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      {
        new: true,
        select: "-password",
      }
    );

    if (!user) {
      if (req.file) fs.unlinkSync(req.file.path);
      res.status(404).json({ message: "Không tìm thấy người dùng" });
      return;
    }

    res.json({ message: "Cập nhật thông tin thành công", user });
  } catch (error: any) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(400).json({ message: error.message });
  }
};

// Xóa người dùng
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await UserModel.findById(req.userId);
    if (!user) {
      res.status(404).json({ message: "Không tìm thấy người dùng" });
      return;
    }

    await RefreshTokenModel.deleteMany({ userId: req.userId });

    if (user.avatar) {
      const avatarPath = path.join(__dirname, "../public", user.avatar);
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
    }

    await UserModel.findByIdAndDelete(req.userId);

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    res.json({ message: "Xóa tài khoản thành công" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};