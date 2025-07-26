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
exports.autoPublishNews = void 0;
const news_model_1 = __importDefault(require("../models/news.model"));
const autoPublishNews = () => __awaiter(void 0, void 0, void 0, function* () {
    const now = new Date();
    const newsToPublish = yield news_model_1.default.find({
        is_published: false,
        published_at: { $lte: now, $ne: null },
    });
    console.log(`[AutoPublish] Số bài cần đăng: ${newsToPublish.length}`);
    for (const news of newsToPublish) {
        news.is_published = true;
        yield news.save();
        console.log(`[AutoPublish] Đã đăng bài: ${news.title} (${news._id})`);
        // TODO: Gửi thông báo cho người dùng nếu cần
    }
});
exports.autoPublishNews = autoPublishNews;
