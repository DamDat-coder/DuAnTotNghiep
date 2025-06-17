"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader) {
        res.status(403).json({ message: "Token không hợp lệ hoặc thiếu" });
        return;
    }
    const token = authHeader.split(" ")[1];
    const jwtSecret = process.env.JWT_SECRET || "default_secret";
    jsonwebtoken_1.default.verify(token, jwtSecret, (err, decoded) => {
        if (err) {
            res.status(401).json({
                message: err.name === "TokenExpiredError" ? "Token đã hết hạn" : "Token không hợp lệ",
            });
            return;
        }
        console.log(decoded.userId);
        req.userId = decoded.userId;
        next();
    });
};
exports.default = verifyToken;
