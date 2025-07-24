import { Request, Response } from "express";
import { ProductCode, VnpLocale } from "vnpay";
import moment from "moment";
import type { ReturnQueryFromVNPay } from "vnpay";
import Payment from "../models/payment.model";
import { Types } from "mongoose";
import axios from "axios";
import crypto from "crypto";
import { ZALO_PAY, vnpay } from "../config/payment.config";
import { generateUniqueTransactionCode } from "../utils/generateTransactionCode";

// VNPay - Tạo thanh toán
export const createVNPayPayment = async (req: Request, res: Response) => {
  try {
    const { totalPrice, userId, orderInfo, discountAmount = 0 } = req.body;

    if (!totalPrice || !userId || !orderInfo) {
      return res.status(400).json({ message: "Thiếu thông tin!" });
    }

    const transactionCode = await generateUniqueTransactionCode("VN");

    const payment = await Payment.create({
      userId: new Types.ObjectId(userId),
      amount: totalPrice,
      discount_amount: discountAmount,
      status: "pending",
      transaction_code: transactionCode,
      transaction_data: {},
      transaction_summary: {},
      order_info: {
        ...orderInfo,
        paymentMethod: "vnpay",
      },
      gateway: "vnpay",
    });

    const paymentUrl = await vnpay.buildPaymentUrl({
      vnp_Amount: totalPrice,
      vnp_IpAddr: req.ip || "127.0.0.1",
      vnp_TxnRef: transactionCode,
      vnp_OrderInfo: `Thanh toán đơn hàng ${transactionCode}|userId:${userId}`,
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
    return res.status(500).json({ message: "Không tạo được URL VNPay", error });
  }
};

// VNPay - Callback xử lý thanh toán
export const checkVNPayReturn = async (req: Request, res: Response) => {
  try {
    const queryParams = req.query as ReturnQueryFromVNPay;

    const isValid = vnpay.verifyReturnUrl(queryParams);
    if (!isValid)
      return res.status(400).json({ message: "Chữ ký không hợp lệ!" });

    const {
      vnp_TxnRef,
      vnp_ResponseCode,
      vnp_PayDate,
      vnp_BankCode,
      vnp_TransactionNo,
    } = queryParams;

    const payment = await Payment.findOne({ transaction_code: vnp_TxnRef });
    if (!payment)
      return res.status(404).json({ message: "Không tìm thấy giao dịch!" });

    payment.status = vnp_ResponseCode === "00" ? "success" : "failed";
    payment.paid_at = vnp_PayDate
      ? moment(vnp_PayDate, "YYYYMMDDHHmmss").toDate()
      : new Date();
    payment.transaction_data = queryParams;
    payment.transaction_summary = {
      gatewayTransactionId: vnp_TransactionNo?.toString(),
      bankCode: vnp_BankCode,
      amount: payment.amount,
    };

    await payment.save();

    const redirect = vnp_ResponseCode === "00" ? "success" : "fail";
    return res.redirect(
      `http://localhost:3300/payment/${redirect}?orderId=${vnp_TxnRef}`
    );
  } catch (error) {
    return res.status(500).json({ message: "Callback VNPay lỗi!", error });
  }
};

// ZaloPay - Tạo thanh toán
export const createZaloPayPayment = async (req: Request, res: Response) => {
  try {
    const { totalPrice, userId, orderInfo, discountAmount = 0 } = req.body;

    if (!totalPrice || !userId || !orderInfo) {
      return res.status(400).json({ message: "Thiếu thông tin thanh toán!" });
    }

    const datePrefix = moment().format("YYMMDD");
    const randomSuffix = Math.floor(Math.random() * 1000000);
    const transactionCode = `${datePrefix}_${randomSuffix}`;

    const app_time = Date.now();

    const embedData = {
      redirecturl: `${ZALO_PAY.returnUrl}?orderId=${transactionCode}`,
      userId,
    };

    const itemList = orderInfo.items.map((item: any) => ({
      itemid: item.productId,
      itemname: item.name,
      itemprice: item.price,
      itemquantity: item.quantity,
    }));

    const order = {
      app_id: ZALO_PAY.appId,
      app_trans_id: transactionCode,
      app_user: `user_${userId.slice(-4)}`, // rút gọn userId
      app_time,
      amount: totalPrice,
      item: JSON.stringify(itemList),
      embed_data: JSON.stringify(embedData),
      description: `Thanh toán đơn hàng ${transactionCode}`,
      bank_code: "",
      callback_url: ZALO_PAY.callbackUrl,
    };

    const data = [
      ZALO_PAY.appId,
      transactionCode,
      order.app_user,
      totalPrice,
      app_time,
      order.embed_data,
      order.item,
    ].join("|");

    (order as any).mac = crypto
      .createHmac("sha256", ZALO_PAY.key1)
      .update(data)
      .digest("hex");

    const zalopayRes = await axios.post(ZALO_PAY.endpoint, null, {
      params: order,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    if (zalopayRes.data.return_code !== 1) {
      return res.status(400).json({
        message: "ZaloPay từ chối giao dịch!",
        error: zalopayRes.data,
      });
    }

    await Payment.create({
      userId: new Types.ObjectId(userId),
      amount: totalPrice,
      discount_amount: discountAmount,
      status: "pending",
      transaction_code: transactionCode,
      transaction_data: order,
      transaction_summary: {},
      order_info: {
        ...orderInfo,
        paymentMethod: "zalopay",
      },
      gateway: "zalopay",
    });

    return res.status(200).json({
      paymentUrl: zalopayRes.data.order_url,
      paymentId: transactionCode,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Không tạo được thanh toán ZaloPay",
      error: (error as any).response?.data || error,
    });
  }
};

// ZaloPay - Callback xử lý thanh toán
export const checkZaloPayReturn = async (req: Request, res: Response) => {
  try {
    const { data, mac } = req.body;
    const computedMac = crypto
      .createHmac("sha256", ZALO_PAY.key2)
      .update(data)
      .digest("hex");

    if (computedMac !== mac) {
      return res.status(400).json({ message: "Chữ ký không hợp lệ!" });
    }

    const result = JSON.parse(data);
    const {
      app_trans_id,
      return_code,
      zp_trans_id,
      bank_code,
      discountamount,
      amount,
      server_time,
    } = result;

    const payment = await Payment.findOne({ transaction_code: app_trans_id });
    if (!payment)
      return res.status(404).json({ message: "Không tìm thấy giao dịch!" });

    if (payment.status !== "pending") {
      return res
        .status(200)
        .json({ message: "Giao dịch đã được xử lý trước đó!" });
    }

    if (return_code === 1) {
      payment.status = "success";
    } else if (return_code === 2) {
      payment.status = "canceled";
    } else {
      payment.status = "failed";
    }

    payment.paid_at = server_time ? new Date(Number(server_time)) : new Date();
    payment.transaction_data = result;
    payment.transaction_summary = {
      gatewayTransactionId: zp_trans_id?.toString(),
      bankCode: bank_code,
      amount: amount,
    };

    if (discountamount) {
      payment.discount_amount = Number(discountamount);
    }

    await payment.save();

    const redirect = return_code === 1 ? "fail" : "success";
    return res.redirect(
      `${ZALO_PAY.returnUrl.replace(
        "success",
        redirect
      )}?orderId=${app_trans_id}`
    );
  } catch (error) {
    return res.status(500).json({ message: "Callback ZaloPay lỗi!", error });
  }
};
export const createCodPayment = async (req: Request, res: Response) => {
  try {
    const { orderId, totalPrice, userId, orderInfo } = req.body;

    if (!userId || !totalPrice || !orderInfo) {
      return res.status(400).json({ message: "Thiếu thông tin thanh toán!" });
    }

    const payment = await Payment.create({
      userId: new Types.ObjectId(userId),
      amount: totalPrice,
      status: "success",
      transaction_code: orderId,
      gateway: "cod",
      transaction_data: {},
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
