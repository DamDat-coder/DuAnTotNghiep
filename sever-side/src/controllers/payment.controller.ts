import { Request, Response } from "express";
import { VNPay, ProductCode, VnpLocale, HashAlgorithm } from "vnpay";
import moment from "moment";
import type { ReturnQueryFromVNPay } from "vnpay";
import Payment, { IPayment } from "../models/payment.model"; 
import { Types } from "mongoose"; 

const vnpay = new VNPay({
  tmnCode: process.env.VNPAY_TMNCODE!,
  secureSecret: process.env.VNPAY_HASH_SECRET!,
  vnpayHost: "https://sandbox.vnpayment.vn",
  testMode: true,
  hashAlgorithm: HashAlgorithm.SHA512,
  loggerFn: () => { }
});

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
    console.error('VNPay create payment error:', error);
    return res.status(500).json({ message: 'Không tạo được URL thanh toán', error });
  }
};

// Xử lý callback từ VNPay sau khi thanh toán
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
    console.error('VNPay return error:', error);
    return res.status(500).json({ message: 'Xử lý callback thất bại!', error });
  }
};
