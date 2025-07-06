import { Request, Response } from 'express';
import Coupon from "../models/coupon.model";
import NotificationModel from "../models/notification.model";
import mongoose from 'mongoose';

// Lấy tất cả coupon
export const getAllCoupons = async (req: Request, res: Response) => {
  try {
    const {
      isActive,
      search,
      page = "1",
      limit = "10"
    } = req.query;
    const filter: any = {};

    if (isActive !== undefined) {
      filter.is_active = isActive === "true";
    }
    if (search) {
      filter.code = { $regex: search as string, $options: "i" };
    }

    const pageNumber = parseInt(page as string) || 1;
    const limitNumber = parseInt(limit as string) || 10;
    const skip = (pageNumber - 1) * limitNumber;
    const total = await Coupon.countDocuments(filter);
    const coupons = await Coupon.find(filter)
      .populate("applicableCategories", "name")
      .populate("applicableProducts", "name")
      .skip(skip)
      .limit(limitNumber)
      .sort({ createdAt: -1 });

    res.status(200).json({
      data: coupons,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error: any) {
    console.error("Lỗi khi lấy danh sách coupon:", error);
    res.status(500).json({
      message: "Lỗi server",
      error: error.message || error,
    });
  }
};

// Lấy coupon theo ID
export const getCouponById = async (req: Request, res: Response) => {
  try {
    const coupon = await Coupon.findById(req.params.id)
      .populate('applicableCategories', 'name')
      .populate('applicableProducts', 'name');

    if (!coupon) {
      return res.status(404).json({ message: 'Không tìm thấy mã giảm giá' });
    }

    res.status(200).json(coupon);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error });
  }
};

// Tạo coupon mới
export const createCoupon = async (req: Request, res: Response) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      startDate,
      endDate,
      usageLimit,
      is_active,
      applicableCategories,
      applicableProducts,
    } = req.body;

    const existing = await Coupon.findOne({ code });
    if (existing) {
      return res.status(400).json({ message: 'Mã giảm giá đã tồn tại' });
    }

    const newCoupon = new Coupon({
      code,
      description,
      discountType,
      discountValue,
      minOrderAmount: minOrderAmount ?? null,
      maxDiscountAmount: maxDiscountAmount ?? null,
      startDate,
      endDate,
      usageLimit: usageLimit ?? null,
      usedCount: 0,
      is_active: is_active ?? true,
      applicableCategories: applicableCategories?.map((id: string) => new mongoose.Types.ObjectId(id)) ?? [],
      applicableProducts: applicableProducts?.map((id: string) => new mongoose.Types.ObjectId(id)) ?? [],
    });

    await newCoupon.save();

    await NotificationModel.create({
      userId: null,
      title: "Mã giảm giá mới vừa được xuất bản!",
      message: `Mã "${code}" hiện đã có hiệu lực từ ngày ${new Date(startDate).toLocaleDateString("vi-VN")}.`,
      type: "coupon",
      isRead: false,
    });

    res.status(201).json({ message: "Tạo mã giảm giá thành công", data: newCoupon });
  } catch (error) {
    console.error("Error creating coupon:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// Cập nhật coupon
export const updateCoupon = async (req: Request, res: Response) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      startDate,
      endDate,
      usageLimit,
      is_active,
      applicableCategories,
      applicableProducts,
    } = req.body;

    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Không tìm thấy mã giảm giá' });
    }

    coupon.code = code ?? coupon.code;
    coupon.description = description ?? coupon.description;
    coupon.discountType = discountType ?? coupon.discountType;
    coupon.discountValue = discountValue ?? coupon.discountValue;
    coupon.minOrderAmount = minOrderAmount ?? coupon.minOrderAmount;
    coupon.maxDiscountAmount = maxDiscountAmount ?? coupon.maxDiscountAmount;
    coupon.startDate = startDate ?? coupon.startDate;
    coupon.endDate = endDate ?? coupon.endDate;
    coupon.usageLimit = usageLimit ?? coupon.usageLimit;
    coupon.is_active = is_active ?? coupon.is_active;
    coupon.applicableCategories =
      applicableCategories?.map((id: string) => new mongoose.Types.ObjectId(id)) ?? coupon.applicableCategories;
    coupon.applicableProducts =
      applicableProducts?.map((id: string) => new mongoose.Types.ObjectId(id)) ?? coupon.applicableProducts;

    await coupon.save();
    res.status(200).json({ message: 'Cập nhật thành công', data: coupon });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error });
  }
};

// Xoá coupon
export const deleteCoupon = async (req: Request, res: Response) => {
  try {
    const deleted = await Coupon.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Không tìm thấy mã giảm giá để xoá' });
    }

    res.status(200).json({ message: 'Xoá mã giảm giá thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error });
  }
};