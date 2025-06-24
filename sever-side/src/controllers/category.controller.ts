import { Request, Response } from "express";
import Category from "../models/category.model";
import slugify from "slugify";
import cloudinary from "../config/cloudinary";
import { UploadApiResponse } from "cloudinary";

interface MulterRequest extends Request {
  file: Express.Multer.File;
}

// Tạo danh mục mới
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, parentId } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Tên danh mục là bắt buộc." });

    const slug = slugify(name, { lower: true });
    const exists = await Category.findOne({ slug });
    if (exists) return res.status(409).json({ success: false, message: "Slug đã tồn tại." });

    let imageUrl: string | null = null;
    if ((req as MulterRequest).file) {
      const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({ folder: "categories" }, (err, result) => {
          if (err || !result) reject(err);
          else resolve(result);
        });
        uploadStream.end((req as MulterRequest).file.buffer);
      });
      imageUrl = result.secure_url;
    }

    const newCategory = await Category.create({
      name,
      slug,
      parentId: parentId || null,
      image: imageUrl,
    });

    res.status(201).json({ success: true, message: "Tạo danh mục thành công.", data: newCategory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Lỗi khi tạo danh mục." });
  }
};

// Lấy danh sách cây danh mục
export const getCategoryTree = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find().lean();

    const buildTree = (parentId: string | null = null): any[] => {
      return categories
        .filter((cat) => {
          const catParentId = cat.parentId ? cat.parentId.toString() : null;
          return catParentId === parentId;
        })
        .map((cat) => ({
          ...cat,
          children: buildTree(cat._id.toString()),
        }));
    };

    const tree = buildTree();

    res.status(200).json({ success: true, data: tree });
  } catch (error) {
    console.error("Lỗi khi lấy cây danh mục:", error);
    res.status(500).json({ success: false, message: "Lỗi khi lấy cây danh mục." });
  }
};

// Cập nhật danh mục
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, parentId } = req.body;
    const updateData: any = {};

    if (name) {
      updateData.name = name;
      updateData.slug = slugify(name, { lower: true });
    }

    if (parentId !== undefined) updateData.parentId = parentId || null;

    if ((req as MulterRequest).file) {
      const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({ folder: "categories" }, (err, result) => {
          if (err || !result) reject(err);
          else resolve(result);
        });
        uploadStream.end((req as MulterRequest).file.buffer);
      });
      updateData.image = result.secure_url;
    }

    const updated = await Category.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: "Không tìm thấy danh mục." });

    res.status(200).json({ success: true, message: "Cập nhật danh mục thành công.", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi khi cập nhật danh mục." });
  }
};

// Xoá danh mục
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const hasChildren = await Category.findOne({ parentId: id });
    if (hasChildren)
      return res.status(400).json({ success: false, message: "Không thể xoá vì có danh mục con." });

    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: "Không tìm thấy danh mục." });

    res.status(200).json({ success: true, message: "Xoá danh mục thành công." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi khi xoá danh mục." });
  }
};
