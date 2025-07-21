import { Request, Response } from "express";
import { vonage, otpMap } from "../config/vonage";

// Gửi OTP
export const sendSmsOTP = async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res
        .status(400)
        .json({ success: false, message: "Vui lòng nhập số điện thoại." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpMap.set(phone, otp);
    console.log(`📩 Gửi OTP ${otp} đến số: ${phone}`);

    console.log("Bắt đầu gửi SMS...");
    try {
      const toPhone = phone.startsWith("0")
        ? "+84" + phone.slice(1)
        : phone; 
        
      const response = await vonage.sms.send({
        to: toPhone,
        from: process.env.VONAGE_FROM || "Shop4Real",
        text: `Mã OTP Shop4Real của bạn là: ${otp}`,
      });
      console.log("Vonage response:", response);
    } catch (error) {
      console.error("Vonage send error:", error);
    }
    console.log("Kết thúc gửi SMS.");

    return res.json({ success: true, message: "Đã gửi OTP qua SMS." });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Gửi SMS OTP thất bại.",
      error: error.message || "Lỗi không xác định.",
    });
  }
};

// Xác minh OTP
export const verifySmsOTP = async (req: Request, res: Response) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu số điện thoại hoặc mã OTP." });
    }

    const savedOTP = otpMap.get(phone);
    if (!savedOTP) {
      return res.status(400).json({
        success: false,
        message: "OTP không tồn tại hoặc đã hết hạn.",
      });
    }

    if (otp !== savedOTP) {
      return res
        .status(401)
        .json({ success: false, message: "Mã OTP không chính xác." });
    }

    otpMap.delete(phone);

    return res.json({ success: true, message: "Xác minh OTP thành công." });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Lỗi xác minh OTP.",
      error: error.message || "Lỗi không xác định.",
    });
  }
};
