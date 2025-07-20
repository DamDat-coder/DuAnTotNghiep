import { Request, Response } from "express";
import OrderModel from "../models/order.model";
import ProductModel from "../models/product.model";
import PaymentModel from "../models/payment.model";
import NotificationModel from "../models/notification.model";
import UserModel from "../models/user.model";
import { generateUniqueTransactionCode } from "../utils/generateTransactionCode";

// Tạo đơn hàng
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { paymentId, order_info } = req.body;

    let userId;
    let paymentMethod: 'cod' | 'vnpay' | 'zalopay';
    let address_id;
    let shippingAddress;
    let items;
    let shipping = 0;
    let discountAmount = 0;

    if (paymentId) {
      const payment = await PaymentModel.findById(paymentId);
      if (!payment || !payment.order_info || !payment.userId) {
        return res.status(400).json({ success: false, message: 'Thông tin thanh toán không hợp lệ.' });
      }

      if (payment.status !== 'success') {
        return res.status(400).json({ success: false, message: 'Thanh toán chưa hoàn tất.' });
      }

      const existed = await OrderModel.findOne({ paymentId });
      if (existed) {
        return res.status(409).json({ success: false, message: 'Đơn hàng đã được tạo từ giao dịch này.' });
      }

      ({ paymentMethod, address_id, shippingAddress, items, shipping = 0, discountAmount = 0 } = payment.order_info);
      userId = payment.userId;
    } else {
      if (!order_info) {
        return res.status(400).json({ success: false, message: 'Thiếu thông tin đơn hàng.' });
      }

      ({ paymentMethod, userId, address_id, shippingAddress, items, shipping = 0, discountAmount = 0 } = order_info);

      if (paymentMethod !== 'cod') {
        return res.status(400).json({ success: false, message: 'Phương thức thanh toán không hợp lệ.' });
      }
    }

    const orderItems = [];
    let totalPrice = 0;

    for (const item of items) {
      const product = await ProductModel.findById(item.productId);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm.' });
      }

      const variant = product.variants.find(v => v.color === item.color && v.size === item.size);
      if (!variant || variant.stock < item.quantity) {
        return res.status(400).json({ success: false, message: 'Biến thể không hợp lệ hoặc hết hàng.' });
      }

      const discountPrice = variant.price * (1 - variant.discountPercent / 100);
      totalPrice += discountPrice * item.quantity;

      orderItems.push({
        productId: product._id,
        name: product.name,
        image: product.image[0] || '',
        color: item.color,
        size: item.size,
        price: discountPrice,
        quantity: item.quantity,
      });

      variant.stock -= item.quantity;
      product.salesCount += item.quantity;
      await product.save();
    }

    totalPrice -= discountAmount;
    totalPrice += shipping;

const orderCode = await generateUniqueTransactionCode("CD");

    const order = await OrderModel.create({
      userId,
      address_id,
      shippingAddress,
      totalPrice,
      discountAmount,
      shipping,
      paymentMethod,
      items: orderItems,
      paymentId: paymentId || null,
      orderCode,
    });

    await NotificationModel.create({
      userId,
      title: 'Đơn hàng của bạn đã được tạo thành công!',
      message: `Đơn hàng #${order.orderCode} đã được xác nhận.`,
      type: 'order',
      isRead: false,
      link: `/profile?tab=order/${order._id}`,
    });

    const admins = await UserModel.find({ role: 'admin' }).select('_id').lean();
    const notis = admins.map(admin => ({
      userId: admin._id,
      title: 'Có đơn hàng mới!',
      message: `Đơn hàng #${order.orderCode} vừa được tạo.`,
      type: 'order',
      isRead: false,
    }));
    await NotificationModel.insertMany(notis);

    return res.status(201).json({ success: true, message: 'Tạo đơn hàng thành công.', data: order });
  } catch (err) {
    console.error('Lỗi tạo đơn hàng:', err);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  }
};

// Lấy tất cả đơn hàng (Admin)
export const getOrders = async (req: Request, res: Response) => {
  try {
    const {
      page = "1",
      limit = "10",
      search,
      status,
    } = req.query;

    const pageNum = Math.max(parseInt(page as string), 1);
    const limitNum = Math.max(parseInt(limit as string), 1);
    const skip = (pageNum - 1) * limitNum;

    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      const users = await UserModel.find({
        name: { $regex: search as string, $options: "i" },
      }).select("_id");

      const userIds = users.map((user) => user._id);
      query.userId = { $in: userIds };
    }

    const [orders, total] = await Promise.all([
      OrderModel.find(query)
        .populate("userId", "name email")
        .populate("paymentId", "amount status paymentMethod")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      OrderModel.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err: any) {
    console.error("Lỗi khi lấy đơn hàng:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi máy chủ.",
      error: err.message,
    });
  }
};

// Lấy đơn hàng theo người dùng
export const getOrdersByUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;

    const orders = await OrderModel.find({ userId })
      .populate("paymentId", "amount status paymentMethod")
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
      .populate("paymentId", "amount status paymentMethod");

    if (!order) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng." });
    }

    res.status(200).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
};

// Cập nhật trạng thái đơn hàng 
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "confirmed", "shipping", "delivered", "cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Trạng thái không hợp lệ." });
    }

    const order = await OrderModel.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("userId", "name email");

    if (!order) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng." });
    }

    await NotificationModel.create({
      userId: order.userId._id,
      title: `Đơn hàng #${order._id} đã được cập nhật`,
      message: `Trạng thái đơn hàng của bạn hiện tại là: ${status}.`,
      type: "order",
      isRead: false,
      link: `/profile?tab=order/${order._id}`,
    });

    res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái thành công.",
      data: order,
    });
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