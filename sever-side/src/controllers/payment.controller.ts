import { Request, Response } from "express";
import { VNPay, ProductCode, VnpLocale, HashAlgorithm } from "vnpay";
import moment from "moment";
import type { ReturnQueryFromVNPay } from "vnpay";
import Payment, { IPayment } from "../models/payment.model";
import { Types } from "mongoose";
import axios from "axios";
import crypto from "crypto";
import ProductModel from "../models/product.model";
import OrderModel from "../models/order.model";

const ZALO_PAY = {
  app_id: Number(process.env.ZALOPAY_APP_ID),
  key1: process.env.ZALOPAY_KEY1!,
  key2: process.env.ZALOPAY_KEY2!,
  endpoint: process.env.ZALOPAY_ENDPOINT!,
  callbackUrl: process.env.ZALOPAY_CALLBACK_URL!,
  returnUrl: process.env.ZALOPAY_RETURN_URL!,
};

const vnpay = new VNPay({
  tmnCode: process.env.VNPAY_TMNCODE!,
  secureSecret: process.env.VNPAY_HASH_SECRET!,
  vnpayHost: "https://sandbox.vnpayment.vn",
  testMode: true,
  hashAlgorithm: HashAlgorithm.SHA512,
  loggerFn: () => { }
});

const MOMO = {
  partnerCode: process.env.MOMO_PARTNER_CODE!,
  accessKey: process.env.MOMO_ACCESS_KEY!,
  secretKey: process.env.MOMO_SECRET_KEY!,
  endpoint: process.env.MOMO_ENDPOINT!,
  returnUrl: process.env.MOMO_RETURN_URL!,
  notifyUrl: process.env.MOMO_NOTIFY_URL!,
};
// Tạo URL thanh toán VNPay
export const createVNPayPayment = async (req: Request, res: Response) => {
  try {
    const { orderId, totalPrice, userId, orderInfo } = req.body;

    if (!orderId || !totalPrice || !userId || !orderInfo) {
      return res.status(400).json({ message: 'Thiếu orderId, totalPrice, userId hoặc orderInfo!' });
    }

    const paymentData: Partial<IPayment> = {
      userId: new Types.ObjectId(userId),
      amount: totalPrice,
      status: 'pending',
      transaction_code: orderId,
      transaction_data: {},
      paid_at: undefined,
      order_info: orderInfo,
    };

    // Lưu bản ghi thanh toán ban đầu (trạng thái pending)
    const payment = await Payment.create(paymentData);

    const paymentUrl = await vnpay.buildPaymentUrl({
      vnp_Amount: totalPrice * 100,
      vnp_IpAddr: req.ip || '127.0.0.1',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: `Thanh toán đơn hàng ${orderId}|userId:${userId}`,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: `http://localhost:3000/api/payment/check-payment-vnpay`,
      vnp_Locale: VnpLocale.VN,
      vnp_CreateDate: Number(moment().format('YYYYMMDDHHmmss')),
      vnp_ExpireDate: Number(moment().add(30, 'minutes').format('YYYYMMDDHHmmss')),
    });

    return res.status(200).json({ paymentUrl, paymentId: payment._id });
  } catch (error) {
    return res.status(500).json({ message: 'Không tạo được URL thanh toán', error });
  }
};

// Xử lý callback từ VNPay
export const checkVNPayReturn = async (req: Request, res: Response) => {
  try {
    const queryParams = req.query as ReturnQueryFromVNPay;

    const isValid = vnpay.verifyReturnUrl(queryParams);
    if (!isValid) {
      return res.status(400).json({ message: 'Chữ ký không hợp lệ!' });
    }

    const {
      vnp_TxnRef,
      vnp_ResponseCode,
      vnp_Amount,
      vnp_TransactionNo,
      vnp_BankCode,
      vnp_PayDate,
      vnp_OrderInfo
    } = queryParams;

    // Lấy lại bản ghi payment đã tạo từ createVNPayPayment
    const existingPayment = await Payment.findOne({ transaction_code: vnp_TxnRef });

    if (!existingPayment) {
      return res.status(404).json({ message: 'Không tìm thấy giao dịch để cập nhật!' });
    }

    // Cập nhật trạng thái giao dịch
    existingPayment.status = vnp_ResponseCode === '00' ? 'success' : 'failed';
    existingPayment.transaction_data = queryParams;
    existingPayment.paid_at = vnp_PayDate
      ? moment(vnp_PayDate, 'YYYYMMDDHHmmss').toDate()
      : new Date();

    await existingPayment.save();

    // Redirect về frontend tuỳ theo kết quả thanh toán
    if (vnp_ResponseCode === '00') {
      return res.redirect(`http://localhost:3300/payment/success?orderId=${vnp_TxnRef}`);
    } else {
      return res.redirect(`http://localhost:3300/payment/fail?orderId=${vnp_TxnRef}`);
    }

  } catch (error) {
    return res.status(500).json({ message: 'Xử lý callback thất bại!', error });
  }
};

// Tạo URL thanh toán VNPay
export const createZaloPayPayment = async (req: Request, res: Response) => {
  try {
    const { totalPrice, userId, orderInfo } = req.body;

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
      order_info: orderInfo,
    });

    const embed_data = {
      redirecturl: ZALO_PAY.returnUrl,
    };

    const order: Record<string, any> = {
      app_id: ZALO_PAY.app_id,
      app_trans_id: orderId,
      app_user: userId.toString(),
      app_time: Date.now(),
      amount: Math.floor(totalPrice),
      item: JSON.stringify([]),
      embed_data: JSON.stringify(embed_data),
      description: `Thanh toán Shop4Real #${orderId}`,
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

    order.mac = crypto.createHmac("sha256", ZALO_PAY.key1).update(dataString).digest("hex");

    const params = new URLSearchParams();
    Object.entries(order).forEach(([key, value]) => {
      params.append(key, value);
    });

    const zaloRes = await axios.post(ZALO_PAY.endpoint, params.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    if (zaloRes.data.return_code !== 1) {
      return res.status(400).json({ message: "Tạo đơn ZaloPay thất bại!", zaloRes: zaloRes.data });
    }

    return res.status(200).json({ paymentUrl: zaloRes.data.order_url, paymentId: payment._id });
  } catch (error) {
    return res.status(500).json({ message: "Không tạo được đơn ZaloPay", error });
  }
};

// Xử lý callback từ ZaloPay
export const checkZaloPayReturn = async (req: Request, res: Response) => {
  try {
    const {
      app_id, app_trans_id, app_time, app_user,
      amount, embed_data, item, description,
      status, message, trans_id, mac,
    } = req.body;

    const dataString = [
      app_id, app_trans_id, app_user, amount,
      app_time, embed_data, item, status,
      message, trans_id,
    ].join("|");

    const expectedMac = crypto.createHmac("sha256", ZALO_PAY.key1).update(dataString).digest("hex");

    if (mac !== expectedMac) {
      return res.status(400).json({ return_code: -1, return_message: "mac not valid" });
    }

    const payment = await Payment.findOne({ transaction_code: app_trans_id });
    if (!payment) {
      return res.status(404).json({ return_code: -1, return_message: "payment not found" });
    }

    const isSuccess = status === 1;
    payment.status = isSuccess ? "success" : "failed";
    payment.transaction_data = req.body;
    payment.paid_at = new Date();
    await payment.save();

    // Nếu thanh toán thành công → tạo Order
    if (isSuccess) {
      const orderInfo = payment.order_info;

      for (const item of orderInfo.items) {
        const product = await ProductModel.findById(item.productId);
        if (!product) continue;

        const variant = product.variants.find(
          (v: any) => v.color === item.color && v.size === item.size
        );
        if (!variant) continue;

        variant.stock -= item.quantity;
        product.salesCount += item.quantity;
        await product.save();
      }

      await OrderModel.create({
        userId: payment.userId,
        couponId: orderInfo.couponId || null,
        address_id: orderInfo.address_id,
        shippingAddress: orderInfo.shippingAddress,
        totalPrice: payment.amount,
        status: "pending",
        paymentMethod: "zalopay",
        paymentStatus: "paid",
        note: orderInfo.note || "",
        items: orderInfo.items.map((i: any) => ({
          product: i.productId,
          color: i.color,
          size: i.size,
          quantity: i.quantity,
        })),
      });
    }

    // 👉 Redirect về frontend theo kết quả thanh toán
    const frontendRedirectBase = "https://sandbox.shop4real.vn/payment";
    const redirectUrl = isSuccess
      ? `${frontendRedirectBase}/success?orderId=${app_trans_id}`
      : `${frontendRedirectBase}/fail?orderId=${app_trans_id}`;

    return res.redirect(302, redirectUrl);
  } catch (error) {
    return res.status(500).json({ return_code: -1, return_message: "internal error" });
  }
};

// Tạo đơn thanh toán MoMo
export const createMomoPayment = async (req: Request, res: Response) => {
  try {
    const { totalPrice, userId, orderInfo } = req.body;

    if (!totalPrice || !userId || !orderInfo) {
      return res.status(400).json({ message: "Thiếu thông tin thanh toán!" });
    }

    const orderId = MOMO.partnerCode + moment().format("YYMMDDHHmmss");
    const requestId = orderId;
    const extraData = "";

    const payment = await Payment.create({
      userId: new Types.ObjectId(userId),
      amount: totalPrice,
      status: "pending",
      transaction_code: orderId,
      transaction_data: {},
      order_info: orderInfo,
    });

    const rawSignature = `accessKey=${MOMO.accessKey}&amount=${totalPrice}&extraData=${extraData}&ipnUrl=${MOMO.notifyUrl}&orderId=${orderId}&orderInfo=Thanh toán đơn hàng #${orderId}&partnerCode=${MOMO.partnerCode}&redirectUrl=${MOMO.returnUrl}&requestId=${requestId}&requestType=captureWallet`;

    const signature = crypto
      .createHmac("sha256", MOMO.secretKey)
      .update(rawSignature)
      .digest("hex");

    const body = {
      partnerCode: MOMO.partnerCode,
      accessKey: MOMO.accessKey,
      requestId,
      amount: totalPrice,
      orderId,
      orderInfo: `Thanh toán đơn hàng #${orderId}`,
      redirectUrl: MOMO.returnUrl,
      ipnUrl: MOMO.notifyUrl,
      extraData,
      requestType: "captureWallet",
      signature,
      lang: "vi",
    };

    const momoRes = await axios.post(MOMO.endpoint, body, {
      headers: { "Content-Type": "application/json" },
    });

    if (momoRes.data?.payUrl) {
      return res.status(200).json({ paymentUrl: momoRes.data.payUrl, paymentId: payment._id });
    }

    return res.status(400).json({ message: "Tạo đơn MoMo thất bại!", momoRes: momoRes.data });
  } catch (error) {
    return res.status(500).json({ message: "Không tạo được đơn MoMo", error });
  }
};
 
// Xử lý callback từ MoMo
export const checkMomoReturn = async (req: Request, res: Response) => {
  try {
    const { orderId, resultCode } = req.query;

    const payment = await Payment.findOne({ transaction_code: orderId });
    if (!payment) {
      return res.status(404).json({ return_code: -1, return_message: "payment not found" });
    }

    const isSuccess = resultCode === "0";
    payment.status = isSuccess ? "success" : "failed";
    payment.transaction_data = req.query;
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

        variant.stock -= item.quantity;
        product.salesCount += item.quantity;
        await product.save();
      }

      await OrderModel.create({
        userId: payment.userId,
        couponId: orderInfo.couponId || null,
        address_id: orderInfo.address_id,
        shippingAddress: orderInfo.shippingAddress,
        totalPrice: payment.amount,
        status: "pending",
        paymentMethod: "momo",
        paymentStatus: "paid",
        note: orderInfo.note || "",
        items: orderInfo.items.map((i: any) => ({
          product: i.productId,
          color: i.color,
          size: i.size,
          quantity: i.quantity,
        })),
      });
    }

    const frontendRedirectBase = "https://sandbox.shop4real.vn/payment";
    const redirectUrl = isSuccess
      ? `${frontendRedirectBase}/success?orderId=${orderId}`
      : `${frontendRedirectBase}/fail?orderId=${orderId}`;

    return res.redirect(302, redirectUrl);
  } catch (error) {
    return res.status(500).json({ return_code: -1, return_message: "internal error" });
  }
};