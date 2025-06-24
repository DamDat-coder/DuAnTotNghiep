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
exports.setDefaultAddress = exports.deleteAddress = exports.updateAddress = exports.addAddress = exports.toggleUserStatus = exports.updateUserInfo = exports.getUserById = exports.getAllUsers = exports.logoutUser = exports.refreshAccessToken = exports.loginUser = exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../models/user.model"));
// Tạo token
const generateAccessToken = (userId, role) => {
    return jsonwebtoken_1.default.sign({ userId, role }, process.env.JWT_SECRET, {
        expiresIn: "1h",
    });
};
const generateRefreshToken = (userId) => {
    return jsonwebtoken_1.default.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "30d",
    });
};
// Đăng ký
const registerUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, name, phone } = req.body;
        const existingUser = yield user_model_1.default.findOne({ email });
        if (existingUser)
            return res.status(400).json({ success: false, message: "Email đã tồn tại." });
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const refreshToken = generateRefreshToken(email);
        const newUser = yield user_model_1.default.create({
            email,
            password: hashedPassword,
            name,
            phone,
            refreshToken,
        });
        const accessToken = generateAccessToken(newUser._id.toString(), newUser.role);
        res.status(201).json({
            success: true,
            message: "Đăng ký thành công.",
            data: {
                accessToken,
                refreshToken,
                user: {
                    id: newUser._id,
                    email: newUser.email,
                    name: newUser.name,
                    role: newUser.role,
                },
            },
        });
    }
    catch (err) {
        next(err);
    }
});
exports.registerUser = registerUser;
// Đăng nhập
const loginUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield user_model_1.default.findOne({ email });
        if (!user)
            return res.status(400).json({ success: false, message: "Email không tồn tại." });
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch)
            return res.status(401).json({ success: false, message: "Mật khẩu sai." });
        if (!user.is_active)
            return res.status(403).json({ success: false, message: "Tài khoản đã bị khóa." });
        const accessToken = generateAccessToken(user._id.toString(), user.role);
        const refreshToken = generateRefreshToken(user._id.toString());
        user.refreshToken = refreshToken;
        yield user.save();
        res.status(200).json({
            success: true,
            message: "Đăng nhập thành công.",
            data: {
                accessToken,
                refreshToken,
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                },
            },
        });
    }
    catch (err) {
        next(err);
    }
});
exports.loginUser = loginUser;
// Làm mới accessToken
const refreshAccessToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken)
            return res.status(401).json({ success: false, message: "Thiếu refresh token." });
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = yield user_model_1.default.findById(decoded.userId);
        if (!user || user.refreshToken !== refreshToken)
            return res.status(403).json({ success: false, message: "Refresh token không hợp lệ." });
        const newAccessToken = generateAccessToken(user._id.toString(), user.role);
        res.status(200).json({ success: true, accessToken: newAccessToken });
    }
    catch (err) {
        next(err);
    }
});
exports.refreshAccessToken = refreshAccessToken;
// Đăng xuất
const logoutUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { refreshToken } = req.body;
        const user = yield user_model_1.default.findOne({ refreshToken });
        if (user) {
            user.refreshToken = null;
            yield user.save();
        }
        res.status(200).json({ success: true, message: "Đăng xuất thành công." });
    }
    catch (err) {
        next(err);
    }
});
exports.logoutUser = logoutUser;
// Lấy tất cả người dùng
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const { search, role } = req.query;
        const filter = {};
        if (search)
            filter.name = { $regex: search.toString(), $options: "i" };
        if (role)
            filter.role = role;
        const total = yield user_model_1.default.countDocuments(filter);
        const users = yield user_model_1.default.find(filter)
            .select("-password -refreshToken")
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            data: users,
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: "Lỗi máy chủ." });
    }
});
exports.getAllUsers = getAllUsers;
// Lấy người dùng theo ID
const getUserById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.default.findById(req.params.id).select("-password");
        if (!user)
            return res.status(404).json({ success: false, message: "Không tìm thấy người dùng." });
        res.status(200).json({ success: true, data: user });
    }
    catch (err) {
        next(err);
    }
});
exports.getUserById = getUserById;
// Cập nhật thông tin người dùng
const updateUserInfo = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, phone, role } = req.body;
        const updates = {};
        if (name)
            updates.name = name;
        if (phone)
            updates.phone = phone;
        if (role && ["user", "admin"].includes(role))
            updates.role = role;
        const user = yield user_model_1.default.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true,
        }).select("-password");
        if (!user)
            return res.status(404).json({ success: false, message: "Không tìm thấy người dùng." });
        res.status(200).json({ success: true, message: "Cập nhật thành công.", data: user });
    }
    catch (err) {
        next(err);
    }
});
exports.updateUserInfo = updateUserInfo;
// Khoá/mở khoá
const toggleUserStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { is_active } = req.body;
        if (typeof is_active !== "boolean")
            return res.status(400).json({ success: false, message: "`is_active` phải là boolean." });
        const user = yield user_model_1.default.findByIdAndUpdate(req.params.id, { is_active }, { new: true }).select("-password");
        if (!user)
            return res.status(404).json({ success: false, message: "Không tìm thấy người dùng." });
        res.status(200).json({
            success: true,
            message: is_active ? "Đã mở khoá tài khoản." : "Đã khoá tài khoản.",
            data: user,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.toggleUserStatus = toggleUserStatus;
// Thêm địa chỉ
const addAddress = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { street, ward, district, province, is_default } = req.body;
        const user = yield user_model_1.default.findById(req.params.id);
        if (!user)
            return res.status(404).json({ success: false, message: "Không tìm thấy người dùng." });
        if (is_default) {
            user.addresses.forEach((addr) => (addr.is_default = false));
        }
        user.addresses.push({ street, ward, district, province, is_default: !!is_default });
        yield user.save();
        res.status(201).json({ success: true, message: "Thêm địa chỉ thành công.", data: user.addresses });
    }
    catch (err) {
        next(err);
    }
});
exports.addAddress = addAddress;
// Cập nhật địa chỉ
const updateAddress = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { street, ward, district, province, is_default } = req.body;
        const user = yield user_model_1.default.findById(req.params.id);
        if (!user)
            return res.status(404).json({ success: false, message: "Không tìm thấy người dùng." });
        const address = user.addresses.id(req.params.addressId);
        if (!address)
            return res.status(404).json({ success: false, message: "Không tìm thấy địa chỉ." });
        if (is_default) {
            user.addresses.forEach((addr) => (addr.is_default = false));
        }
        address.street = street !== null && street !== void 0 ? street : address.street;
        address.ward = ward !== null && ward !== void 0 ? ward : address.ward;
        address.district = district !== null && district !== void 0 ? district : address.district;
        address.province = province !== null && province !== void 0 ? province : address.province;
        address.is_default = is_default !== null && is_default !== void 0 ? is_default : address.is_default;
        yield user.save();
        res.status(200).json({ success: true, message: "Cập nhật địa chỉ thành công.", data: user.addresses });
    }
    catch (err) {
        next(err);
    }
});
exports.updateAddress = updateAddress;
// Xoá địa chỉ
const deleteAddress = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.default.findById(req.params.id);
        if (!user)
            return res.status(404).json({ success: false, message: "Không tìm thấy người dùng." });
        const address = user.addresses.id(req.params.addressId);
        if (!address)
            return res.status(404).json({ success: false, message: "Không tìm thấy địa chỉ." });
        address.deleteOne();
        yield user.save();
        res.status(200).json({ success: true, message: "Xoá địa chỉ thành công.", data: user.addresses });
    }
    catch (err) {
        next(err);
    }
});
exports.deleteAddress = deleteAddress;
// Đặt địa chỉ mặc định
const setDefaultAddress = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.default.findById(req.params.id);
        if (!user)
            return res.status(404).json({ success: false, message: "Không tìm thấy người dùng." });
        const address = user.addresses.id(req.params.addressId);
        if (!address)
            return res.status(404).json({ success: false, message: "Không tìm thấy địa chỉ." });
        user.addresses.forEach((addr) => (addr.is_default = false));
        address.is_default = true;
        yield user.save();
        res.status(200).json({ success: true, message: "Cập nhật mặc định thành công.", data: user.addresses });
    }
    catch (err) {
        next(err);
    }
});
exports.setDefaultAddress = setDefaultAddress;
