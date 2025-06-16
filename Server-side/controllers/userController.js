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
exports.disableUser = exports.updateUser = exports.getAllUser = exports.getUser = exports.refresh = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = __importDefault(require("../models/userModel"));
const refreshTokenModel_1 = __importDefault(require("../models/refreshTokenModel"));
// Đăng ký
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (yield userModel_1.default.findOne({ email })) {
            res.status(409).json({ message: "Email đã tồn tại" });
            return;
        }
        if (phone && (yield userModel_1.default.findOne({ phone }))) {
            res.status(409).json({ message: "Số điện thoại đã tồn tại" });
            return;
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const newUser = new userModel_1.default({
            email,
            password: hashedPassword,
            name,
            addresses: addresses || [],
            phone: phone || null,
            role: "user",
        });
        const data = yield newUser.save();
        const _a = data.toObject(), { password: _ } = _a, userData = __rest(_a, ["password"]);
        const jwtSecret = process.env.JWT_SECRET || "default_secret";
        const accessToken = jsonwebtoken_1.default.sign({ id: data._id }, jwtSecret, { expiresIn: "1h" });
        const refreshToken = jsonwebtoken_1.default.sign({ id: data._id }, jwtSecret, { expiresIn: "30d" });
        yield refreshTokenModel_1.default.create({
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
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.register = register;
// Đăng nhập
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { identifier, password } = req.body;
        if (!identifier || !password) {
            res.status(400).json({ message: "Vui lòng cung cấp email hoặc số điện thoại và mật khẩu" });
            return;
        }
        const user = yield userModel_1.default.findOne({
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
        if (!(yield bcryptjs_1.default.compare(password, user.password))) {
            res.status(401).json({ message: "Mật khẩu không đúng" });
            return;
        }
        const jwtSecret = process.env.JWT_SECRET || "default_secret";
        const accessToken = jsonwebtoken_1.default.sign({ id: user._id }, jwtSecret, { expiresIn: "1h" });
        const refreshToken = jsonwebtoken_1.default.sign({ id: user._id }, jwtSecret, { expiresIn: "30d" });
        yield refreshTokenModel_1.default.create({
            userId: user._id,
            token: refreshToken,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });
        const _a = user.toObject(), { password: _ } = _a, userData = __rest(_a, ["password"]);
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });
        res.json({ message: "Đăng nhập thành công", accessToken, user: userData });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.login = login;
// Làm mới token
const refresh = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            res.status(400).json({ message: "Thiếu Refresh Token" });
            return;
        }
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
            message: error.name === "TokenExpiredError" ? "Refresh Token đã hết hạn" : "Refresh Token không hợp lệ",
        });
    }
});
exports.refresh = refresh;
// Lấy thông tin người dùng
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const user = yield userModel_1.default.findById(userId).select("-password");
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
// Lấy tất cả người dùng
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
// Cập nhật thông tin người dùng (user thường hoặc admin)
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const requesterId = req.userId;
        const requesterRole = req.role;
        const { name, addresses, phone, password, is_active, userId } = req.body;
        const targetUserId = requesterRole === 'admin' && userId ? userId : requesterId;
        const updates = {};
        if (name)
            updates.name = name;
        if (addresses)
            updates.addresses = addresses;
        if (phone) {
            const existingPhoneUser = yield userModel_1.default.findOne({ phone, _id: { $ne: targetUserId } });
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
            updates.password = yield bcryptjs_1.default.hash(password, 10);
        }
        if (requesterRole === 'admin' && typeof is_active === 'boolean') {
            updates.is_active = is_active;
        }
        const updatedUser = yield userModel_1.default.findByIdAndUpdate(targetUserId, { $set: updates }, { new: true, select: "-password" });
        if (!updatedUser) {
            res.status(404).json({ message: "Không tìm thấy người dùng" });
            return;
        }
        res.json({ message: "Cập nhật thông tin thành công", user: updatedUser });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.updateUser = updateUser;
// Khóa người dùng (không khóa admin)
const disableUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const user = yield userModel_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ message: "Không tìm thấy người dùng" });
            return;
        }
        if (user.role === "admin") {
            res.status(403).json({ message: "Không thể khóa tài khoản admin" });
            return;
        }
        user.is_active = false;
        yield user.save();
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        });
        res.json({ message: "Tài khoản đã bị khóa thành công" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.disableUser = disableUser;
