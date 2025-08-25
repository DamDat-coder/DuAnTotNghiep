import { Request, Response } from "express";
import mongoose from "mongoose";
import Coupon from "../models/coupon.model";
import NotificationModel from "../models/notification.model";
import Product from "../models/product.model";

// Lấy tất cả coupon
export const getAllCoupons = async (req: Request, res: Response) => {
  try {
    const { isActive, search, page = "1", limit = "10" } = req.query;

    await Coupon.updateMany(
      { is_active: true, endDate: { $lt: new Date() } },
      { $set: { is_active: false } }
    );

    const filter: any = {};
    if (isActive !== undefined) {
      filter.is_active = isActive === "true";
    }
    if (search) {
      filter.code = { $regex: search as string, $options: "i" };
    }

    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
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
    res.status(500).json({ message: "Lỗi server", error: error.message || error });
  }
};

// Lấy coupon theo ID
export const getCouponById = async (req: Request, res: Response) => {
  try {
    const coupon = await Coupon.findById(req.params.id)
      .populate("applicableCategories", "name")
      .populate("applicableProducts", "name");

    if (!coupon) {
      return res.status(404).json({ message: "Không tìm thấy mã giảm giá" });
    }

    res.status(200).json(coupon);
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi server", error: error.message || error });
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
      return res.status(400).json({ message: "Mã giảm giá đã tồn tại" });
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
      applicableCategories: (applicableCategories || []).map(
        (id: string) => new mongoose.Types.ObjectId(id)
      ),
      applicableProducts: (applicableProducts || []).map(
        (id: string) => new mongoose.Types.ObjectId(id)
      ),
    });

    await newCoupon.save();

    await NotificationModel.create({
      userId: null,
      title: "Mã giảm giá mới vừa được xuất bản!",
      message: `Mã "${code}" hiện đã có hiệu lực từ ngày ${new Date(startDate).toLocaleDateString("vi-VN")}.`,
      type: "coupon",
      link: `/coupons`,
      isRead: false,
    });

    res.status(201).json({ message: "Tạo mã giảm giá thành công", data: newCoupon });
  } catch (error: any) {
    console.error("Error creating coupon:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message || error });
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
      return res.status(404).json({ message: "Không tìm thấy mã giảm giá" });
    }

    coupon.code = code ?? coupon.code;
    coupon.description = description ?? coupon.description;
    coupon.discountType = discountType ?? coupon.discountType;
    coupon.discountValue = discountValue ?? coupon.discountValue;
    coupon.minOrderAmount = minOrderAmount ?? coupon.minOrderAmount;
    coupon.maxDiscountAmount = maxDiscountAmount ?? coupon.maxDiscountAmount;
    coupon.startDate = startDate === "" || startDate === null ? null : (startDate ?? coupon.startDate);
    coupon.endDate = endDate === "" || endDate === null ? null : (endDate ?? coupon.endDate);
    coupon.usageLimit = usageLimit ?? coupon.usageLimit;
    coupon.is_active = is_active ?? coupon.is_active;

    if (applicableCategories)
      coupon.applicableCategories = applicableCategories.map(
        (id: string) => new mongoose.Types.ObjectId(id)
      );
    if (applicableProducts)
      coupon.applicableProducts = applicableProducts.map(
        (id: string) => new mongoose.Types.ObjectId(id)
      );

    await coupon.save();
    res.status(200).json({ message: "Cập nhật thành công", data: coupon });
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi server", error: error.message || error });
  }
};

// Ẩn coupon (ngừng hoạt động)
export const hideCoupon = async (req: Request, res: Response) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({ message: "Không tìm thấy mã giảm giá để ẩn" });
    }

    if (!coupon.is_active) {
      return res.status(400).json({ message: "Mã giảm giá đã bị ẩn trước đó" });
    }

    coupon.is_active = false;
    await coupon.save();

    res.status(200).json({ message: "Đã ẩn mã giảm giá thành công" });
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi server", error: error.message || error });
  }
};

// Áp dụng coupon
export const applyCoupon = async (req: Request, res: Response) => {
  try {
    const { code, items } = req.body;

    if (!code || !items || !Array.isArray(items)) {
      return res.status(400).json({ status: "error", message: "Thiếu mã hoặc danh sách sản phẩm" });
    }

    const coupon = await Coupon.findOne({ code });

    if (!coupon || !coupon.is_active) {
      return res.status(404).json({ status: "error", message: "Mã giảm giá không tồn tại hoặc không hoạt động" });
    }

    const now = new Date();
    if (
      (coupon.startDate && now < new Date(coupon.startDate)) ||
      (coupon.endDate && now > new Date(coupon.endDate))
    ) {
      return res.status(400).json({ status: "error", message: "Mã giảm giá đã hết hạn hoặc chưa bắt đầu" });
    }

    if (coupon.usageLimit && coupon.usedCount && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ status: "error", message: "Mã giảm giá đã hết lượt sử dụng" });
    }

    const productIds = items.map((item: any) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } }).populate("category");

    let totalAmount = 0;
    let itemsWithDiscount: any[] = [];

    for (const item of items) {
      const product = products.find(p => p._id.toString() === item.productId);
      if (!product) continue;

      const itemTotal = item.price * item.quantity;
      totalAmount += itemTotal;

      // kiểm tra sản phẩm/danh mục có thuộc coupon hay không
      let isApplicable =
        (!coupon.applicableProducts || coupon.applicableProducts.length === 0 || coupon.applicableProducts.some(id => id.equals(product._id))) ||
        (!coupon.applicableCategories || coupon.applicableCategories.length === 0 || coupon.applicableCategories.some(id => id.equals(product.category._id)));

      itemsWithDiscount.push({
        productId: product._id,
        name: product.name,
        quantity: item.quantity,
        price: item.price,
        total: itemTotal,
        isDiscounted: isApplicable,
        itemDiscount: 0,
        priceAfterDiscount: item.price,
        totalAfterDiscount: itemTotal
      });
    }

    // kiểm tra min/max order
    if (coupon.minOrderAmount && totalAmount < coupon.minOrderAmount) {
      return res.status(400).json({ status: "error", message: `Đơn hàng phải tối thiểu ${coupon.minOrderAmount} để áp dụng mã này` });
    }
    if (coupon.maxOrderAmount && totalAmount > coupon.maxOrderAmount) {
      return res.status(400).json({ status: "error", message: `Đơn hàng vượt quá mức tối đa ${coupon.maxOrderAmount} để áp dụng mã này` });
    }

    // tính giảm giá
    const applicableItems = itemsWithDiscount.filter(i => i.isDiscounted);
    let discount = 0;

    if (coupon.discountType === "percent") {
      for (const item of applicableItems) {
        item.itemDiscount = (item.total * coupon.discountValue) / 100;
        discount += item.itemDiscount;
      }
      // giới hạn giảm tối đa
      if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
        const factor = coupon.maxDiscountAmount / discount;
        discount = coupon.maxDiscountAmount;
        for (const item of applicableItems) {
          item.itemDiscount = parseFloat((item.itemDiscount * factor).toFixed(2));
        }
      }
    } else if (coupon.discountType === "fixed") {
      let totalApplicable = applicableItems.reduce((sum, i) => sum + i.total, 0);
      let remainingDiscount = Math.min(coupon.discountValue, totalApplicable);
      for (const item of applicableItems) {
        const ratio = item.total / totalApplicable;
        item.itemDiscount = parseFloat((remainingDiscount * ratio).toFixed(2));
        discount += item.itemDiscount;
      }
    }

    // cập nhật giá sau giảm
    for (const item of itemsWithDiscount) {
      const totalAfter = item.total - item.itemDiscount;
      item.totalAfterDiscount = parseFloat(totalAfter.toFixed(2));
      item.priceAfterDiscount = parseFloat((totalAfter / item.quantity).toFixed(2));
    }

    const finalAmount = totalAmount - discount;

    return res.status(200).json({
      status: "success",
      message: "Áp dụng mã thành công",
      data: {
        totalAmount,
        discount,
        finalAmount,
        couponCode: coupon.code,
        items: itemsWithDiscount
      }
    });
  } catch (error) {
    console.error("Lỗi applyCoupon:", error);
    res.status(500).json({ status: "error", message: "Lỗi server khi áp dụng mã" });
  }
};
