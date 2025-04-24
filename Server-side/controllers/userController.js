const multer = require("multer");
const path = require("path");
const fs = require("fs");
const userModel = require("../models/userModel");
const RefreshTokenModel = require("../models/refreshTokenModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Đảm bảo thư mục upload tồn tại
const uploadDir = "./public/images";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpg|jpeg|png|gif|webp/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) cb(null, true);
    else cb(new Error("Chỉ được upload file ảnh (jpg, jpeg, png, gif, webp)"));
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});


// Đăng ký
const register = [
  upload.single("avatar"),
  async (req, res) => {
    try {
      const { email, password, name, address, phone } = req.body;
      if (!email || !password || !name) {
        throw new Error("Email, mật khẩu và tên là bắt buộc");
      }
      if (password.length < 6) {
        throw new Error("Mật khẩu phải dài ít nhất 6 ký tự");
      }

      const checkEmail = await userModel.findOne({ email });
      if (checkEmail) {
        return res.status(409).json({ message: "Email đã tồn tại" });
      }

      // Kiểm tra phone chỉ khi phone được cung cấp và không rỗng
      if (phone && phone.trim() !== "") {
        const checkPhone = await userModel.findOne({ phone });
        if (checkPhone) {
          return res.status(409).json({ message: "Số điện thoại đã tồn tại" });
        }
      }

      const hashPassword = await bcrypt.hash(password, 10);
      const newUser = new userModel({
        email,
        password: hashPassword,
        name,
        address: address || null,
        phone: phone && phone.trim() !== "" ? phone : null, // Chỉ gán phone nếu không rỗng
        avatar: req.file ? `/images/${req.file.filename}` : null,
        role: "user",
      });

      const data = await newUser.save();
      const { password: _, ...userData } = data._doc;

      const jwtSecret = process.env.JWT_SECRET || "default_secret";
      const accessToken = jwt.sign({ id: data._id }, jwtSecret, {
        expiresIn: "1h",
      });
      const refreshToken = jwt.sign({ id: data._id }, jwtSecret, {
        expiresIn: "30d",
      });

      await RefreshTokenModel.create({
        userId: data._id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60 * 1000,
        sameSite: "Strict",
      });

      res
        .status(201)
        .json({ message: "Đăng ký thành công", accessToken, user: userData });
    } catch (error) {
      if (req.file) fs.unlinkSync(req.file.path);
      res.status(400).json({ message: error.message });
    }
  },
];

// Đăng nhập
const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res
        .status(400)
        .json({
          message: "Vui lòng cung cấp email hoặc số điện thoại và mật khẩu",
        });
    }

    const user = await userModel.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });

    if (!user) {
      return res
        .status(404)
        .json({ message: "Email hoặc số điện thoại không tồn tại" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Mật khẩu không đúng" });
    }

    const jwtSecret = process.env.JWT_SECRET || "default_secret";
    const accessToken = jwt.sign({ id: user._id }, jwtSecret, {
      expiresIn: "1h",
    });
    const refreshToken = jwt.sign({ id: user._id }, jwtSecret, {
      expiresIn: "30d",
    });

    await RefreshTokenModel.create({
      userId: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: "Strict",
    });

    const { password: _, ...userData } = user._doc;
    res.json({ message: "Đăng nhập thành công", accessToken, user: userData });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Làm mới token
const refresh = async (req, res) => {
  console.log("Refresh token request:", req.cookies, "User ID:", req.userId);
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken)
    return res.status(400).json({ message: "Thiếu Refresh Token" });

  try {
    const jwtSecret = process.env.JWT_SECRET || "default_secret";
    const decoded = jwt.verify(refreshToken, jwtSecret);
    const tokenDoc = await RefreshTokenModel.findOne({
      userId: decoded.id,
      token: refreshToken,
    });
    if (!tokenDoc)
      return res.status(401).json({ message: "Refresh Token không hợp lệ" });

    const accessToken = jwt.sign({ id: decoded.id }, jwtSecret, {
      expiresIn: "1h",
    });
    res.json({ accessToken, message: "Làm mới token thành công" });
  } catch (error) {
    res.status(401).json({
      message:
        error.name === "TokenExpiredError"
          ? "Refresh Token đã hết hạn"
          : "Refresh Token không hợp lệ",
    });
  }
};

// Middleware xác thực token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({ message: "Token không hợp lệ hoặc thiếu" });
  }

  const token = authHeader.split(" ")[1];
  const jwtSecret = process.env.JWT_SECRET || "default_secret";

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        message:
          err.name === "TokenExpiredError"
            ? "Token đã hết hạn"
            : "Token không hợp lệ",
      });
    }
    req.userId = decoded.id;
    next();
  });
};

// Lấy thông tin user
const getUser = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId, { password: 0 });
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getAllUser = async (req, res) => {
  try {
    const users = await userModel.find({}, { password: 0 }); // Lấy tất cả user, bỏ password
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Middleware kiểm tra admin
const verifyAdmin = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.userId);
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });
    if (user.role !== "admin")
      return res.status(403).json({ message: "Không có quyền truy cập" });
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật thông tin người dùng
const updateUser = [
  upload.single("avatar"),
  async (req, res) => {
    try {
      const { name, address, phone, password } = req.body;
      const updates = {};

      if (name) updates.name = name;
      if (address) updates.address = address;
      if (phone) {
        const checkPhone = await userModel.findOne({
          phone,
          _id: { $ne: req.userId },
        });
        if (checkPhone) {
          return res
            .status(409)
            .json({ message: "Số điện thoại đã được sử dụng" });
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

      const user = await userModel.findByIdAndUpdate(
        req.userId,
        { $set: updates },
        { new: true, select: "-password" }
      );

      if (!user) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(404).json({ message: "Không tìm thấy người dùng" });
      }

      res.json({ message: "Cập nhật thông tin thành công", user });
    } catch (error) {
      if (req.file) fs.unlinkSync(req.file.path);
      res.status(400).json({ message: error.message });
    }
  },
];

// Xóa người dùng
const deleteUser = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    await RefreshTokenModel.deleteMany({ userId: req.userId });

    if (user.avatar) {
      const avatarPath = path.join(__dirname, "../public", user.avatar);
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
    }

    await userModel.findByIdAndDelete(req.userId);

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    res.json({ message: "Xóa tài khoản thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  register,
  login,
  getUser,
  verifyToken,
  verifyAdmin,
  refresh,
  updateUser,
  deleteUser,
  getAllUser,
};
