"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResetPasswordEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const sendResetPasswordEmail = (to, resetLink) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = nodemailer_1.default.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    const mailOptions = {
        from: `"Shop4Real" <${process.env.EMAIL_USER}>`,
        to,
        subject: "Khôi phục mật khẩu - Shop4Real",
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="text-align: center; color: #111827;"> Đặt lại mật khẩu</h2>
        <p style="font-size: 16px; color: #374151;">Xin chào,</p>
        <p style="font-size: 16px; color: #374151;">
          Bạn nhận được email này vì đã yêu cầu đặt lại mật khẩu cho tài khoản Shop4Real.
        </p>
        <p style="font-size: 16px; color: #374151;">
          Vui lòng nhấn vào nút bên dưới để đặt lại mật khẩu của bạn:
        </p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${resetLink}" style="background-color: #111827; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">
            Đặt lại mật khẩu
          </a>
        </div>
        <p style="font-size: 14px; color: #6b7280;">
          Nếu nút không hoạt động, bạn có thể sao chép và dán liên kết sau vào trình duyệt:
        </p>
        <p style="font-size: 14px; color: #2563eb; word-break: break-all;">
          <a href="${resetLink}" style="color: #2563eb;">${resetLink}</a>
        </p>
        <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;" />
        <p style="font-size: 13px; color: #9ca3af; text-align: center;">
          Liên kết đặt lại mật khẩu có hiệu lực trong 15 phút. Nếu bạn không yêu cầu, hãy bỏ qua email này.
        </p>
      </div>
    `,
    };
    yield transporter.sendMail(mailOptions);
});
exports.sendResetPasswordEmail = sendResetPasswordEmail;
