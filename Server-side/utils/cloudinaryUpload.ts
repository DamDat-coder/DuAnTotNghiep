import cloudinary from "../config/cloudinary";
import { UploadApiResponse } from "cloudinary";

export const uploadImageToCloudinary = async (fileBase64: string): Promise<UploadApiResponse> => {
  return await cloudinary.uploader.upload(fileBase64, {
    folder: "news_images",
  });
};

export const uploadMultipleImagesToCloudinary = async (imageList: string[]): Promise<string[]> => {
  const uploadPromises = imageList.map((image) =>
    cloudinary.uploader.upload(image, { folder: "news_images" })
  );
  const results = await Promise.all(uploadPromises);
  return results.map((res) => res.secure_url);
};

export const deleteImageFromCloudinary = async (imageUrl: string): Promise<void> => {
  try {
    const parts = imageUrl.split('/');
    const publicIdWithExtension = parts.slice(parts.indexOf('upload') + 1).join('/');
    const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, '');
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Lỗi xoá ảnh Cloudinary:', error);
  }
};
