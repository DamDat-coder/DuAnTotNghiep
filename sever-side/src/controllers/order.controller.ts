import { Request, Response, NextFunction } from "express";
import OrderModel from "../models/order.model";
import ProductModel from "../models/product.model";
import UserModel from "../models/user.model";
import CouponModel from "../models/coupon.model";
import PaymentModel from "../models/payment.model";

// Tạo đơn hàng sau khi thanh toán thành công
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.body;

    const payment = await PaymentModel.findById(paymentId);
    if (!payment || payment.status !== "success") {
      return res.status(400).json({ success: false, message: "Thanh toán chưa hoàn tất hoặc không tồn tại." });
    }

    if (!payment.order_info || !payment.userId) {
      return res.status(400).json({ success: false, message: "Thiếu thông tin để tạo đơn hàng." });
    }

    const existingOrder = await OrderModel.findOne({ paymentId });
    if (existingOrder) {
      return res.status(409).json({ success: false, message: "Đơn hàng đã được tạo từ giao dịch này." });
    }

    const { address_id, shippingAddress, couponId, items } = payment.order_info;
    const userId = payment.userId;

    const orderItems = [];
    let totalPrice = 0;

    for (const item of items) {
      const product = await ProductModel.findById(item.productId);
      if (!product) {
        return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm." });
      }

      const variant = product.variants.find(v => v.color === item.color && v.size === item.size);
      if (!variant) {
        return res.status(400).json({ success: false, message: "Biến thể sản phẩm không hợp lệ." });
      }

      if (variant.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Sản phẩm ${product.name} không đủ hàng.` });
      }

      const discountPrice = variant.price * (1 - variant.discountPercent / 100);
      const itemTotal = discountPrice * item.quantity;
      totalPrice += itemTotal;

      orderItems.push({
        productId: product._id,
        name: product.name,
        image: product.image[0] || "",
        color: item.color,
        size: item.size,
        price: discountPrice,
        quantity: item.quantity,
      });

      variant.stock -= item.quantity;
      product.salesCount += item.quantity;
      await product.save();
    }

    if (couponId) {
      const coupon = await CouponModel.findById(couponId);
      if (!coupon || !coupon.is_active) {
        return res.status(400).json({ success: false, message: "Mã giảm giá không hợp lệ." });
      }

      const now = new Date();
      if (now < coupon.startDate || now > coupon.endDate) {
        return res.status(400).json({ success: false, message: "Mã giảm giá hết hiệu lực." });
      }

      if (coupon.usageLimit && (coupon.usedCount ?? 0) >= coupon.usageLimit) {
        return res.status(400).json({ success: false, message: "Mã giảm giá đã hết lượt dùng." });
      }

      if (coupon.minOrderAmount && totalPrice < coupon.minOrderAmount) {
        return res.status(400).json({ success: false, message: `Cần tối thiểu ${coupon.minOrderAmount}đ để áp dụng mã.` });
      }

      let discountAmount = 0;
      if (coupon.discountType === "percent") {
        discountAmount = (totalPrice * coupon.discountValue) / 100;
      } else {
        discountAmount = coupon.discountValue;
      }

      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }

      totalPrice -= discountAmount;
      coupon.usedCount = (coupon.usedCount ?? 0) + 1;
      await coupon.save();
    }

    const order = await OrderModel.create({
      userId,
      address_id,
      shippingAddress,
      couponId: couponId || null,
      totalPrice,
      items: orderItems,
      paymentId: payment._id,
    });
    console.log("Order created with ID:", order._id);
    return res.status(201).json({ success: true, message: "Tạo đơn hàng thành công.", data: order });
  } catch (err) {
    console.error("Tạo order sau thanh toán thất bại:", err);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
};

// Lấy tất cả đơn hàng (Admin)
export const getOrders = async (req: Request, res: Response) => {
  try {
    const orders = await OrderModel.find()
      .populate("userId", "name email")
      .populate("couponId", "code discountValue")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
};

// Lấy đơn hàng theo người dùng
export const getOrdersByUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const orders = await OrderModel.find({ userId })
      .populate("couponId", "code discountValue")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
};

// Lấy đơn hàng theo ID
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const order = await OrderModel.findById(req.params.id)
      .populate("userId", "name email")
      .populate("couponId", "code discountValue");

    if (!order) return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng." });

    res.status(200).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
};

// Cập nhật trạng thái đơn hàng
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Trạng thái không hợp lệ." });
    }

    const order = await OrderModel.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng." });
    }

    res.status(200).json({ success: true, message: "Cập nhật trạng thái thành công.", data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
};

// Huỷ đơn hàng (người dùng)
export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const order = await OrderModel.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng." });

    if (order.status !== "pending") {
      return res.status(400).json({ success: false, message: "Chỉ có thể huỷ đơn hàng đang chờ xử lý." });
    }

    order.status = "cancelled";
    await order.save();

    res.status(200).json({ success: true, message: "Huỷ đơn hàng thành công.", data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
};