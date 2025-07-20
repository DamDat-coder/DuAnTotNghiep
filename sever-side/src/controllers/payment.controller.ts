import { Request, Response } from "express";
import { VNPay, ProductCode, VnpLocale } from "vnpay";
import moment from "moment";
import type { ReturnQueryFromVNPay } from "vnpay";
import Payment, { IPayment } from "../models/payment.model";
import OrderModel from "../models/order.model";
import ProductModel from "../models/product.model";
import { Types } from "mongoose";
import axios from "axios";
import crypto from "crypto";
import { ZALO_PAY, vnpay } from "../config/payment.config";

// Tạo URL thanh toán VNPay
export const createVNPayPayment = async (req: Request, res: Response) => {
  try {
    const { orderId, totalPrice, userId, orderInfo, shipping } = req.body;

    if (!orderId || !totalPrice || !userId || !orderInfo) {
      return res
        .status(400)
        .json({ message: "Thiếu orderId, totalPrice, userId hoặc orderInfo!" });
    }

    const paymentData: Partial<IPayment> = {
      userId: new Types.ObjectId(userId),
      amount: totalPrice,
      status: "pending",
      transaction_code: orderId,
      transaction_data: {},
      paid_at: undefined,
      order_info: {
        ...orderInfo,
        shipping: shipping ?? 0,
      },
    };

    const payment = await Payment.create(paymentData);

    const paymentUrl = await vnpay.buildPaymentUrl({
      vnp_Amount: totalPrice,
      vnp_IpAddr: req.ip || "127.0.0.1",
      vnp_TxnRef: orderId,
      vnp_OrderInfo: `Thanh toán đơn hàng ${orderId}|userId:${userId}`,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: `http://localhost:3000/api/payment/check-payment-vnpay`,
      vnp_Locale: VnpLocale.VN,
      vnp_CreateDate: Number(moment().format("YYYYMMDDHHmmss")),
      vnp_ExpireDate: Number(
        moment().add(30, "minutes").format("YYYYMMDDHHmmss")
      ),
    });

    return res.status(200).json({ paymentUrl, paymentId: payment._id });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Không tạo được URL thanh toán", error });
  }
};

// Xử lý callback từ VNPay
export const checkVNPayReturn = async (req: Request, res: Response) => {
  try {
    const queryParams = req.query as ReturnQueryFromVNPay;

    const isValid = vnpay.verifyReturnUrl(queryParams);
    if (!isValid) {
      return res.status(400).json({ message: "Chữ ký không hợp lệ!" });
    }

    const { vnp_TxnRef, vnp_ResponseCode, vnp_PayDate } = queryParams;

    const payment = await Payment.findOne({ transaction_code: vnp_TxnRef });
    if (!payment) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy giao dịch để cập nhật!" });
    }

    payment.status = vnp_ResponseCode === "00" ? "success" : "failed";
    payment.transaction_data = queryParams;
    payment.paid_at = vnp_PayDate
      ? moment(vnp_PayDate, "YYYYMMDDHHmmss").toDate()
      : new Date();
    await payment.save();

    if (vnp_ResponseCode === "00") {
      const orderInfo = payment.order_info;

      for (const item of orderInfo.items) {
        const product = await ProductModel.findById(item.productId);
        if (!product) continue;

        const variant = product.variants.find(
          (v: any) => v.color === item.color && v.size === item.size
        );
        if (!variant) continue;

        variant.stock = Math.max(variant.stock - item.quantity, 0);
        product.salesCount += item.quantity;
        await product.save();
      }

      await OrderModel.create({
        userId: payment.userId,
        couponId: orderInfo.couponId || null,
        address_id: orderInfo.address_id,
        shippingAddress: orderInfo.shippingAddress,
        totalPrice: payment.amount,
        shipping: orderInfo.shipping || 0,
        status: "pending",
        paymentMethod: "vnpay",
        paymentStatus: "paid",
        note: orderInfo.note || "",
        items: orderInfo.items.map((i: any) => ({
          productId: i.productId,
          name: i.name,
          image: i.image,
          color: i.color,
          size: i.size,
          quantity: i.quantity,
          price: i.price ?? 0,
        })),
      });
    }

    const redirectBase = "http://localhost:3300/payment";
    return res.redirect(
      vnp_ResponseCode === "00"
        ? `${redirectBase}/success?orderId=${vnp_TxnRef}`
        : `${redirectBase}/fail?orderId=${vnp_TxnRef}`
    );
  } catch (error) {
    return res.status(500).json({ message: "Xử lý callback thất bại!", error });
  }
};

// Tạo URL thanh toán ZaloPay
export const createZaloPayPayment = async (req: Request, res: Response) => {
  try {
    const { totalPrice, userId, orderInfo, shipping } = req.body;

    if (!totalPrice || !userId || !orderInfo) {
      return res.status(400).json({ message: "Thiếu thông tin thanh toán!" });
    }

    const orderId = moment().format("YYMMDD_HHmmss");

    const payment = await Payment.create({
      userId: new Types.ObjectId(userId),
      amount: totalPrice,
      status: "pending",
      transaction_code: orderId,
      transaction_data: {},
      order_info: {
        ...orderInfo,
        shipping: shipping ?? 0,
      },
    });

    const embed_data = {
      redirecturl: `http://localhost:3000/api/payment/check-payment-zalopay`,
    };

    const order: Record<string, any> = {
      app_id: ZALO_PAY.app_id,
      app_trans_id: orderId,
      app_user: userId.toString(),
      app_time: Date.now(),
      amount: Math.floor(totalPrice),
      item: JSON.stringify([]),
      embed_data: JSON.stringify(embed_data),
      description: `Thanh toán Style For You #${orderId}`,
      callback_url: ZALO_PAY.callbackUrl,
      bank_code: "zalopayapp",
    };

    const dataString = [
      order.app_id,
      order.app_trans_id,
      order.app_user,
      order.amount,
      order.app_time,
      order.embed_data,
      order.item,
    ].join("|");

    order.mac = crypto
      .createHmac("sha256", ZALO_PAY.key1)
      .update(dataString)
      .digest("hex");
    const params = new URLSearchParams();
    Object.entries(order).forEach(([key, value]) => {
      params.append(key, value);
    });

    const zaloRes = await axios.post(ZALO_PAY.endpoint, params.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    if (zaloRes.data.return_code !== 1) {
      return res.status(400).json({
        message: "Tạo đơn ZaloPay thất bại!",
        zaloRes: zaloRes.data,
      });
    }

    return res.status(200).json({
      paymentUrl: zaloRes.data.order_url,
      paymentId: payment._id,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Không tạo được đơn ZaloPay",
      error: error instanceof Error ? error.message : error,
    });
  }
};

// Xử lý callback từ ZaloPay
export const checkZaloPayReturn = async (req: Request, res: Response) => {
  try {
    const {
      app_id,
      app_trans_id,
      app_time,
      app_user,
      amount,
      embed_data,
      item,
      description,
      status,
      message,
      trans_id,
      mac,
    } = req.body;

    const dataString = [
      app_id,
      app_trans_id,
      app_user,
      amount,
      app_time,
      embed_data,
      item,
      status,
      message,
      trans_id,
    ].join("|");

    const expectedMac = crypto
      .createHmac("sha256", ZALO_PAY.key1)
      .update(dataString)
      .digest("hex");

    if (mac !== expectedMac) {
      return res
        .status(400)
        .json({ return_code: -1, return_message: "Chữ ký không hợp lệ!" });
    }

    const payment = await Payment.findOne({ transaction_code: app_trans_id });
    if (!payment) {
      return res
        .status(404)
        .json({ return_code: -1, return_message: "Không tìm thấy giao dịch!" });
    }

    const isSuccess = status === 1;
    payment.status = isSuccess ? "success" : "failed";
    payment.transaction_data = req.body;
    payment.paid_at = new Date();
    await payment.save();

    if (isSuccess) {
      const orderInfo = payment.order_info;

      for (const item of orderInfo.items) {
        const product = await ProductModel.findById(item.productId);
        if (!product) continue;

        const variant = product.variants.find(
          (v: any) => v.color === item.color && v.size === item.size
        );
        if (!variant) continue;

        variant.stock = Math.max(variant.stock - item.quantity, 0);
        product.salesCount += item.quantity;
        await product.save();
      }

      await OrderModel.create({
        userId: payment.userId,
        couponId: orderInfo.couponId || null,
        address_id: orderInfo.address_id,
        shippingAddress: orderInfo.shippingAddress,
        totalPrice: payment.amount,
        shipping: orderInfo.shipping || 0,
        status: "pending",
        paymentMethod: "zalopay",
        paymentStatus: "paid",
        note: orderInfo.note || "",
        items: orderInfo.items.map((i: any) => ({
          productId: i.productId,
          name: i.name,
          image: i.image,
          color: i.color,
          size: i.size,
          quantity: i.quantity,
          price: i.price ?? 0,
        })),
      });
    }

    const redirectBase = "http://localhost:3300/payment";
    const redirectUrl = isSuccess
      ? `${redirectBase}/success?orderId=${app_trans_id}`
      : `${redirectBase}/fail?orderId=${app_trans_id}`;

    return res.redirect(redirectUrl);
  } catch (error) {
    return res
      .status(500)
      .json({ return_code: -1, return_message: "Xử lý callback thất bại!" });
  }
};
export const createCodPayment = async (req: Request, res: Response) => {
  try {
    const { orderId, totalPrice, userId, orderInfo } = req.body;

    if (!userId || !totalPrice || !orderInfo) {
      return res.status(400).json({ message: "Thiếu thông tin thanh toán!" });
    }

    const payment = await Payment.create({
      userId: new Types.ObjectId(userId), // 👈 đảm bảo đúng kiểu
      amount: totalPrice,
      status: "success",
      transaction_code: orderId,
      transaction_data: {}, // 👈 thêm field này để thống nhất schema
      order_info: orderInfo,
      paid_at: new Date(),
    });

    return res.status(200).json({
      paymentId: payment._id,
      message: "Tạo thanh toán COD thành công",
    });
  } catch (error) {
    console.error("Lỗi tạo COD payment:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
