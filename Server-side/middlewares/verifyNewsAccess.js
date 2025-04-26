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
const newsModel_1 = __importDefault(require("../models/newsModel"));
const verifyNewsAccess = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const news = yield newsModel_1.default.findById(id);
        if (!news) {
            res.status(404).json({ message: "Không tìm thấy tin tức" });
            return;
        }
        // Members can only edit/delete their own news; admins can edit/delete any news
        if (req.userRole === "member" && news.author.toString() !== req.userId) {
            res.status(403).json({ message: "Chỉ được chỉnh sửa hoặc xóa tin tức của chính bạn" });
            return;
        }
        next();
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.default = verifyNewsAccess;
