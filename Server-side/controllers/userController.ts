import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserModel, { IUser } from "../models/userModel";
import RefreshTokenModel from "../models/refreshTokenModel";

// Đăng ký
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, addresses, phone } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ message: "Email, mật khẩu và tên là bắt buộc" });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: "Mật khẩu phải dài ít nhất 6 ký tự" });
      return;
    }

    if (await UserModel.findOne({ email })) {
      res.status(409).json({ message: "Email đã tồn tại" });
      return;
    }

    if (phone && (await UserModel.findOne({ phone }))) {
      res.status(409).json({ message: "Số điện thoại đã tồn tại" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserModel({
      email,
      password: hashedPassword,
      name,
      addresses: addresses || [],
      phone: phone || null,
      role: "user",
    });

    const data = await newUser.save();
    const { password: _, ...userData } = data.toObject();

    const jwtSecret = process.env.JWT_SECRET || "default_secret";
    const accessToken = jwt.sign({ id: data._id }, jwtSecret, { expiresIn: "1h" });
    const refreshToken = jwt.sign({ id: data._id }, jwtSecret, { expiresIn: "30d" });

    await RefreshTokenModel.create({
      userId: data._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ message: "Đăng ký thành công", accessToken, user: userData });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Đăng nhập
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      res.status(400).json({ message: "Vui lòng cung cấp email hoặc số điện thoại và mật khẩu" });
      return;
    }

    const user = await UserModel.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });

    if (!user) {
      res.status(404).json({ message: "Email hoặc số điện thoại không tồn tại" });
      return;
    }

    if (!user.is_active) {
      res.status(403).json({ message: "Tài khoản đã bị khóa" });
      return;
    }

    if (!(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ message: "Mật khẩu không đúng" });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET || "default_secret";
    const accessToken = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: "1h" });
    const refreshToken = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: "30d" });

    await RefreshTokenModel.create({
      userId: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    const { password: _, ...userData } = user.toObject();
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({ message: "Đăng nhập thành công", accessToken, user: userData });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Làm mới token
export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      res.status(400).json({ message: "Thiếu Refresh Token" });
      return;
    }

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
      message: error.name === "TokenExpiredError" ? "Refresh Token đã hết hạn" : "Refresh Token không hợp lệ",
    });
  }
};

// Lấy thông tin người dùng
export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const user = await UserModel.findById(userId).select("-password");
    if (!user) {
      res.status(404).json({ message: "Không tìm thấy người dùng" });
      return;
    }
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy tất cả người dùng
export const getAllUser = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await UserModel.find().select("-password");
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật thông tin người dùng (user thường hoặc admin)
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const requesterId = (req as any).userId;
    const requesterRole = (req as any).role;

    const { name, addresses, phone, password, is_active, userId } = req.body;

    const targetUserId = requesterRole === 'admin' && userId ? userId : requesterId;

    const updates: Partial<IUser> = {};

    if (name) updates.name = name;
    if (addresses) updates.addresses = addresses;

    if (phone) {
      const existingPhoneUser = await UserModel.findOne({ phone, _id: { $ne: targetUserId } });
      if (existingPhoneUser) {
        res.status(409).json({ message: "Số điện thoại đã được sử dụng" });
        return;
      }
      updates.phone = phone;
    }

    if (password) {
      if (password.length < 6) {
        res.status(400).json({ message: "Mật khẩu mới phải dài ít nhất 6 ký tự" });
        return;
      }
      updates.password = await bcrypt.hash(password, 10);
    }

    if (requesterRole === 'admin' && typeof is_active === 'boolean') {
      updates.is_active = is_active;
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      targetUserId,
      { $set: updates },
      { new: true, select: "-password" }
    );

    if (!updatedUser) {
      res.status(404).json({ message: "Không tìm thấy người dùng" });
      return;
    }

    res.json({ message: "Cập nhật thông tin thành công", user: updatedUser });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};


// Khóa người dùng 
export const disableUser  = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;

    const user = await UserModel.findById(userId);

    if (!user) {
      res.status(404).json({ message: "Không tìm thấy người dùng" });
      return;
    }

    if (user.role === "admin") {
      res.status(403).json({ message: "Không thể khóa tài khoản admin" });
      return;
    }

    user.is_active = false;
    await user.save();

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    res.json({ message: "Tài khoản đã bị khóa thành công" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

