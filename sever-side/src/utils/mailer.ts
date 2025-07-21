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
    from: `"Style For You" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Khôi phục mật khẩu - Style For You",
    html: `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
    <h2 style="text-align: center; color: #111827;">Style For You</h2>
    <h3 style="text-align: center; color: #111827;">Đặt lại mật khẩu</h3>
    <p style="font-size: 16px; color: #374151;">Xin chào,</p>
    <p style="font-size: 16px; color: #374151;">
      Bạn nhận được email này vì đã yêu cầu đặt lại mật khẩu cho tài khoản Style For You.
    </p>
    <p style="font-size: 16px; color: #374151;">
      Vui lòng nhấn vào nút bên dưới để đặt lại mật khẩu của bạn:
    </p>
    <div style="text-align: center; margin: 24px 0;">
      <a href="${resetLink}" style="background-color: #111827; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">
        Đặt lại mật khẩu
      </a>
    </div>
    <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;" />
    <p style="font-size: 13px; color: #9ca3af; text-align: center;">
      Liên kết đặt lại mật khẩu có hiệu lực trong 15 phút. Nếu bạn không yêu cầu, hãy bỏ qua email này.
    </p>
  </div>
`,
  };

  await transporter.sendMail(mailOptions);
};

export const sendAccountLockedEmail = async (to: string, name: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Style For You" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Tài khoản của bạn đã bị khóa",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="text-align: center; color: #111827;">Style For You</h2>
        <p>Xin chào ${name || ""},</p>
        <p>Tài khoản của bạn đã bị khóa do vi phạm chính sách hoặc yêu cầu từ quản trị viên.</p>
        <p>Nếu bạn cần hỗ trợ, vui lòng liên hệ với chúng tôi.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendAccountUnlockedEmail = async (to: string, name: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Style For You" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Tài khoản của bạn đã được mở khóa",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="text-align: center; color: #111827;">Style For You</h2>
        <p>Xin chào ${name || ""},</p>
        <p>Tài khoản của bạn đã được mở khóa và có thể sử dụng lại bình thường.</p>
        <p>Nếu bạn cần hỗ trợ, vui lòng liên hệ với chúng tôi.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
