import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const sendResetPasswordEmail = async (to: string, resetLink: string) => {
  const transporter = nodemailer.createTransport({
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

  await transporter.sendMail(mailOptions);
};
