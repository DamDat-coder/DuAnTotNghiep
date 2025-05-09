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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.getAllUser = exports.getUser = exports.refresh = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const userModel_1 = __importDefault(require("../models/userModel"));
const refreshTokenModel_1 = __importDefault(require("../models/refreshTokenModel"));
// Load environment variables
dotenv_1.default.config();
// Đăng ký
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const checkEmail = yield userModel_1.default.findOne({ email });
        if (checkEmail) {
            res.status(409).json({ message: "Email đã tồn tại" });
            return;
        }
        // Kiểm tra số điện thoại đã tồn tại (nếu có)
        if (phone) {
            const checkPhone = yield userModel_1.default.findOne({ phone });
            if (checkPhone) {
                res.status(409).json({ message: "Số điện thoại đã tồn tại" });
                return;
            }
        }
        // Mã hóa mật khẩu
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        // Tạo người dùng mới
        const newUser = new userModel_1.default({
            email,
            password: hashedPassword,
            name,
            address: address || null,
            phone: phone || null,
            avatar: req.file ? `/images/${req.file.filename}` : null,
            role: "user",
        });
        const data = yield newUser.save();
        const _a = data.toObject(), { password: _ } = _a, userData = __rest(_a, ["password"]);
        // Tạo JWT tokens
        const jwtSecret = process.env.JWT_SECRET || "default_secret";
        const accessToken = jsonwebtoken_1.default.sign({ id: data._id }, jwtSecret, { expiresIn: "1h" });
        const refreshToken = jsonwebtoken_1.default.sign({ id: data._id }, jwtSecret, { expiresIn: "30d" });
        // Lưu refresh token vào database
        yield refreshTokenModel_1.default.create({
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
    }
    catch (error) {
        // Xóa file ảnh nếu có lỗi
        if (req.file)
            fs_1.default.unlinkSync(req.file.path);
        res.status(400).json({ message: error.message });
    }
});
exports.register = register;
// Đăng nhập
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const user = yield userModel_1.default.findOne({
            $or: [{ email: identifier }, { phone: identifier }],
        });
        if (!user) {
            res.status(404).json({ message: "Email hoặc số điện thoại không tồn tại" });
            return;
        }
        // Kiểm tra mật khẩu
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ message: "Mật khẩu không đúng" });
            return;
        }
        // Tạo JWT tokens
        const jwtSecret = process.env.JWT_SECRET || "default_secret";
        const accessToken = jsonwebtoken_1.default.sign({ id: user._id }, jwtSecret, { expiresIn: "1h" });
        const refreshToken = jsonwebtoken_1.default.sign({ id: user._id }, jwtSecret, { expiresIn: "30d" });
        // Lưu refresh token vào database
        yield refreshTokenModel_1.default.create({
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
        const _a = user.toObject(), { password: _ } = _a, userData = __rest(_a, ["password"]);
        res.json({ message: "Đăng nhập thành công", accessToken, user: userData });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.login = login;
// Làm mới token
const refresh = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        res.status(400).json({ message: "Thiếu Refresh Token" });
        return;
    }
    try {
        const jwtSecret = process.env.JWT_SECRET || "default_secret";
        const decoded = jsonwebtoken_1.default.verify(refreshToken, jwtSecret);
        const tokenDoc = yield refreshTokenModel_1.default.findOne({
            userId: decoded.id,
            token: refreshToken,
        });
        if (!tokenDoc) {
            res.status(401).json({ message: "Refresh Token không hợp lệ" });
            return;
        }
        const accessToken = jsonwebtoken_1.default.sign({ id: decoded.id }, jwtSecret, { expiresIn: "1h" });
        res.json({ accessToken, message: "Làm mới token thành công" });
    }
    catch (error) {
        res.status(401).json({
            message: error.name === "TokenExpiredError"
                ? "Refresh Token đã hết hạn"
                : "Refresh Token không hợp lệ",
        });
    }
});
exports.refresh = refresh;
// Lấy thông tin user
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModel_1.default.findById(req.userId).select("-password");
        if (!user) {
            res.status(404).json({ message: "Không tìm thấy người dùng" });
            return;
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getUser = getUser;
// Lấy tất cả user
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
        const { name, address, phone, password } = req.body;
        const updates = {};
        if (name)
            updates.name = name;
        if (address)
            updates.address = address;
        if (phone) {
            const checkPhone = yield userModel_1.default.findOne({ phone, _id: { $ne: req.userId } });
            if (checkPhone) {
                res.status(409).json({ message: "Số điện thoại đã được sử dụng" });
                return;
            }
            updates.phone = phone;
        }
        if (req.file)
            updates.avatar = `/images/${req.file.filename}`;
        if (password) {
            if (password.length < 6) {
                throw new Error("Mật khẩu mới phải dài ít nhất 6 ký tự");
            }
            updates.password = yield bcryptjs_1.default.hash(password, 10);
        }
        const user = yield userModel_1.default.findByIdAndUpdate(req.userId, { $set: updates }, {
            new: true,
            select: "-password",
        });
        if (!user) {
            if (req.file)
                fs_1.default.unlinkSync(req.file.path);
            res.status(404).json({ message: "Không tìm thấy người dùng" });
            return;
        }
        res.json({ message: "Cập nhật thông tin thành công", user });
    }
    catch (error) {
        if (req.file)
            fs_1.default.unlinkSync(req.file.path);
        res.status(400).json({ message: error.message });
    }
});
exports.updateUser = updateUser;
// Xóa người dùng
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModel_1.default.findById(req.userId);
        if (!user) {
            res.status(404).json({ message: "Không tìm thấy người dùng" });
            return;
        }
        yield refreshTokenModel_1.default.deleteMany({ userId: req.userId });
        if (user.avatar) {
            const avatarPath = path_1.default.join(__dirname, "../public", user.avatar);
            if (fs_1.default.existsSync(avatarPath)) {
                fs_1.default.unlinkSync(avatarPath);
            }
        }
        yield userModel_1.default.findByIdAndDelete(req.userId);
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        });
        res.json({ message: "Xóa tài khoản thành công" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.deleteUser = deleteUser;
