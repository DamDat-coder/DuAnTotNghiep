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
      <h3>Yêu cầu khôi phục mật khẩu</h3>
      <p>Click vào liên kết bên dưới để đặt lại mật khẩu:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>Liên kết này có hiệu lực trong 15 phút.</p>
    `,
    };
    yield transporter.sendMail(mailOptions);
});
exports.sendResetPasswordEmail = sendResetPasswordEmail;
