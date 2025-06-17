"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disableUser = exports.updateUser = exports.getAllUser = exports.getUser = exports.refresh = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = __importDefault(require("../models/userModel"));
const refreshTokenModel_1 = __importDefault(require("../models/refreshTokenModel"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Đăng ký
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, name, addresses = [], phone } = req.body;
        // Kiểm tra đầu vào
        if (!email || !password || !name) {
            res.status(400).json({ message: "Email, mật khẩu và họ tên là bắt buộc." });
            return;
        }
        // Kiểm tra tồn tại email hoặc số điện thoại (chỉ nếu phone khác null)
        const existingUser = yield userModel_1.default.findOne({
            $or: [
                { email },
                ...(phone ? [{ phone }] : [])
            ]
        });
        if (existingUser) {
            res.status(409).json({ message: "Email hoặc số điện thoại đã tồn tại." });
            return;
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const newUser = yield userModel_1.default.create({
            email,
            password: hashedPassword,
            name,
            addresses,
            phone: phone || null, // Nếu không có thì để null rõ ràng
        });
        res.status(201).json({
            message: "Đăng ký thành công.",
            user: {
                _id: newUser._id,
                email: newUser.email,
                name: newUser.name,
                phone: newUser.phone,
                role: newUser.role,
                is_active: newUser.is_active,
            },
        });
    }
    catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ message: "Đã xảy ra lỗi máy chủ." });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ message: "Vui lòng nhập email hoặc số điện thoại và mật khẩu." });
            return;
        }
        let user;
        // Kiểm tra nếu là số => tìm theo phone
        if (/^\d+$/.test(email)) {
            user = yield userModel_1.default.findOne({ phone: Number(email) });
        }
        else {
            // Ngược lại tìm theo email
            user = yield userModel_1.default.findOne({ email });
        }
        if (!user) {
            res.status(401).json({ message: "Tài khoản không tồn tại." });
            return;
        }
        const isPasswordValid = yield bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ message: "Mật khẩu không đúng." });
            return;
        }
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET chưa được cấu hình.");
        }
        const token = jsonwebtoken_1.default.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(200).json({
            message: "Đăng nhập thành công.",
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Đã xảy ra lỗi máy chủ." });
    }
});
exports.login = login;
// Làm mới token
const refresh = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            res.status(400).json({ message: "Thiếu refresh token." });
            return;
        }
        const jwtSecret = process.env.JWT_SECRET || "default_secret";
        const decoded = jsonwebtoken_1.default.verify(refreshToken, jwtSecret);
        const tokenDoc = yield refreshTokenModel_1.default.findOne({
            userId: decoded.id,
            token: refreshToken,
        });
        if (!tokenDoc) {
            res.status(401).json({ message: "Refresh token không hợp lệ." });
            return;
        }
        const accessToken = jsonwebtoken_1.default.sign({ id: decoded.id }, jwtSecret, { expiresIn: "1h" });
        res.json({ accessToken, message: "Làm mới token thành công." });
    }
    catch (error) {
        res.status(401).json({
            message: error.name === "TokenExpiredError"
                ? "Refresh token đã hết hạn."
                : "Refresh token không hợp lệ.",
        });
    }
});
exports.refresh = refresh;
// Lấy thông tin cá nhân
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const user = yield userModel_1.default.findById(userId).select("-password");
        if (!user) {
            res.status(404).json({ message: "Không tìm thấy người dùng." });
            return;
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getUser = getUser;
// Lấy tất cả người dùng (admin)
const getAllUser = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield userModel_1.default.find().select("-password");
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getAllUser = getAllUser;
// Cập nhật thông tin người dùng
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const requesterId = req.userId;
        const requesterRole = req.role;
        const { name, addresses, phone, password, is_active, userId } = req.body;
        const targetUserId = requesterRole === "admin" && userId ? userId : requesterId;
        const updates = {};
        if (name)
            updates.name = name;
        if (addresses)
            updates.addresses = addresses;
        if (phone) {
            const daTonTai = yield userModel_1.default.findOne({ phone, _id: { $ne: targetUserId } });
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
            updates.password = yield bcryptjs_1.default.hash(password, 10);
        }
        if (requesterRole === "admin" && typeof is_active === "boolean") {
            updates.is_active = is_active;
        }
        const updatedUser = yield userModel_1.default.findByIdAndUpdate(targetUserId, { $set: updates }, { new: true, select: "-password" });
        if (!updatedUser) {
            res.status(404).json({ message: "Không tìm thấy người dùng." });
            return;
        }
        res.json({ message: "Cập nhật thông tin thành công.", user: updatedUser });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.updateUser = updateUser;
// Khóa tài khoản
const disableUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const user = yield userModel_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ message: "Không tìm thấy người dùng." });
            return;
        }
        if (user.role === "admin") {
            res.status(403).json({ message: "Không thể khóa tài khoản admin." });
            return;
        }
        user.is_active = false;
        yield user.save();
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        });
        res.json({ message: "Tài khoản đã bị khóa thành công." });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.disableUser = disableUser;
