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
exports.deleteImageFromCloudinary = exports.uploadMultipleImagesToCloudinary = exports.uploadImageToCloudinary = void 0;
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const uploadImageToCloudinary = (fileBase64) => __awaiter(void 0, void 0, void 0, function* () {
    return yield cloudinary_1.default.uploader.upload(fileBase64, {
        folder: "news_images",
    });
});
exports.uploadImageToCloudinary = uploadImageToCloudinary;
const uploadMultipleImagesToCloudinary = (imageList) => __awaiter(void 0, void 0, void 0, function* () {
    const uploadPromises = imageList.map((image) => cloudinary_1.default.uploader.upload(image, { folder: "news_images" }));
    const results = yield Promise.all(uploadPromises);
    return results.map((res) => res.secure_url);
});
exports.uploadMultipleImagesToCloudinary = uploadMultipleImagesToCloudinary;
const deleteImageFromCloudinary = (imageUrl) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parts = imageUrl.split('/');
        const publicIdWithExtension = parts.slice(parts.indexOf('upload') + 1).join('/');
        const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, '');
        yield cloudinary_1.default.uploader.destroy(publicId);
    }
    catch (error) {
        console.error('Lỗi xoá ảnh Cloudinary:', error);
    }
});
exports.deleteImageFromCloudinary = deleteImageFromCloudinary;
