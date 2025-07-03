import { Request, Response } from "express";
import OrderModel from "../models/order.model";
import ProductModel from "../models/product.model";
import CouponModel from "../models/coupon.model";
import PaymentModel from "../models/payment.model";

// Tạo đơn hàng
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { paymentId, order_info } = req.body;

    let paymentMethod: string;
    let userId;
    let address_id;
    let shippingAddress;
    let couponId;
    let items;
    let shipping = 0;
    let note = "";

    // Nếu là đơn COD thì lấy từ order_info truyền trực tiếp
    if (!paymentId) {
      if (!order_info) return res.status(400).json({ success: false, message: "Thiếu thông tin đơn hàng." });

      ({
        paymentMethod,
        userId,
        address_id,
        shippingAddress,
        couponId,
        items,
        shipping = 0,
        note = ""
      } = order_info);

      if (paymentMethod !== "cod") {
        return res.status(400).json({ success: false, message: "Phương thức thanh toán không hợp lệ." });
      }
    } else {
      // Với các phương thức online (vnpay, momo,...)
      const payment = await PaymentModel.findById(paymentId);
      if (!payment || !payment.order_info || !payment.userId) {
        return res.status(400).json({ success: false, message: "Thông tin thanh toán không hợp lệ." });
      }

      if (payment.status !== "success") {
        return res.status(400).json({ success: false, message: "Thanh toán chưa hoàn tất." });
      }

      const existingOrder = await OrderModel.findOne({ paymentId });
      if (existingOrder) {
        return res.status(409).json({ success: false, message: "Đơn hàng đã được tạo từ giao dịch này." });
      }

      ({
        paymentMethod,
        address_id,
        shippingAddress,
        couponId,
        items,
        shipping = 0,
        note = ""
      } = payment.order_info);
      userId = payment.userId;
    }

    // Tính toán đơn hàng
    const orderItems = [];
    let totalPrice = 0;

    for (const item of items) {
      const product = await ProductModel.findById(item.productId);
      if (!product) {
        return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm." });
      }

      const variant = product.variants.find(v => v.color === item.color && v.size === item.size);
      if (!variant || variant.stock < item.quantity) {
        return res.status(400).json({ success: false, message: "Biến thể không hợp lệ hoặc hết hàng." });
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

    // Áp dụng mã giảm giá
    if (couponId) {
      const coupon = await CouponModel.findById(couponId);
      if (coupon && coupon.is_active) {
        const now = new Date();
        if (now >= coupon.startDate && now <= coupon.endDate) {
          if (coupon.usageLimit && (coupon.usedCount ?? 0) >= coupon.usageLimit) {
            return res.status(400).json({ success: false, message: "Mã giảm giá hết lượt." });
          }
          if (coupon.minOrderAmount && totalPrice < coupon.minOrderAmount) {
            return res.status(400).json({ success: false, message: "Không đủ điều kiện dùng mã." });
          }

          let discount = coupon.discountType === 'percent'
            ? (totalPrice * coupon.discountValue) / 100
            : coupon.discountValue;

          if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
            discount = coupon.maxDiscountAmount;
          }

          totalPrice -= discount;
          coupon.usedCount = (coupon.usedCount ?? 0) + 1;
          await coupon.save();
        }
      }
    }

    totalPrice += shipping;

    const order = await OrderModel.create({
      userId,
      address_id,
      shippingAddress,
      couponId: couponId || null,
      totalPrice,
      shipping,
      paymentMethod,
      note,
      items: orderItems,
      paymentId: paymentId || null,
    });

    return res.status(201).json({ success: true, message: "Tạo đơn hàng thành công.", data: order });
  } catch (err) {
    console.error("Lỗi tạo đơn hàng:", err);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
};

// Lấy tất cả đơn hàng (Admin)
export const getOrders = async (req: Request, res: Response) => {
  try {
    const orders = await OrderModel.find()
      .populate("userId", "name email")
      .populate("couponId", "code discountValue")
      .populate("paymentId", "amount status")
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
      .populate("paymentId", "amount status")
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
      .populate("couponId", "code discountValue")
      .populate("paymentId", "amount status");

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
    const validStatuses = ["pending", "confirmed", "shipping", "delivered", "cancelled"];

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
