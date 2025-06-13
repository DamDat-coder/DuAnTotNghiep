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
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinary_1 = require("cloudinary");
const stream_1 = require("stream");
const uploadToCloudinary = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { base64, mimetype } = req.body;
        if (!base64 || !mimetype) {
            throw new Error('Thiếu dữ liệu file hoặc mimetype');
        }
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(mimetype)) {
            throw new Error('Chỉ được upload file ảnh (jpg, jpeg, png, webp)');
        }
        const fileBuffer = Buffer.from(base64, 'base64');
        const stream = cloudinary_1.v2.uploader.upload_stream({ folder: 'clothing_store', resource_type: 'image' }, (error, result) => {
            if (error)
                return next(error);
            if (result) {
                res.json({ secure_url: result.secure_url });
            }
            else {
                next(new Error('Lỗi upload Cloudinary'));
            }
        });
        const bufferStream = new stream_1.Readable();
        bufferStream.push(fileBuffer);
        bufferStream.push(null);
        bufferStream.pipe(stream);
    }
    catch (err) {
        next(err);
    }
});
exports.default = uploadToCloudinary;
