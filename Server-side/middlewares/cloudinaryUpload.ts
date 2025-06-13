import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { Request, Response, NextFunction } from 'express';


const uploadToCloudinary = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
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

        const stream = cloudinary.uploader.upload_stream(
            { folder: 'clothing_store', resource_type: 'image' },
            (error, result) => {
                if (error) return next(error);
                if (result) {
                    res.json({ secure_url: result.secure_url });
                } else {
                    next(new Error('Lỗi upload Cloudinary'));
                }
            }
        );

        const bufferStream = new Readable();
        bufferStream.push(fileBuffer);
        bufferStream.push(null);
        bufferStream.pipe(stream);
    } catch (err) {
        next(err);
    }
};

export default uploadToCloudinary;
