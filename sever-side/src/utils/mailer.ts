import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Khởi tạo transporter chung
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Gửi email đặt lại mật khẩu
export const sendResetPasswordEmail = async (to: string, resetLink: string) => {
  const mailOptions = {
    from: `"Style For You" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Khôi phục mật khẩu - Style For You",
    html: `
      <div style="font-family: Arial; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="text-align: center; color: #111827;">Style For You</h2>
        <h3 style="text-align: center; color: #111827;">Đặt lại mật khẩu</h3>
        <p style="font-size: 16px;">Xin chào,</p>
        <p style="font-size: 16px;">Bạn đã yêu cầu đặt lại mật khẩu. Nhấn nút bên dưới để tiếp tục:</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${resetLink}" style="background-color: #111827; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">
            Đặt lại mật khẩu
          </a>
        </div>
        <p style="font-size: 13px; color: #6b7280; text-align: center;">
          Liên kết này chỉ có hiệu lực trong 15 phút. Nếu không phải bạn, hãy bỏ qua.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Gửi email cảnh báo spam review
export const sendReviewWarningEmail = async (to: string, name: string) => {
  const mailOptions = {
    from: `"Style For You" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Cảnh báo spam đánh giá - Style For You",
    html: `
      <div style="font-family: Arial; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #fbbf24; border-radius: 8px;">
        <h2 style="text-align: center; color: #b45309;">⚠️ Cảnh báo</h2>
        <p>Xin chào ${name},</p>
        <p>Bạn đã có 2 đánh giá bị đánh dấu là spam. Nếu tiếp tục, tài khoản sẽ bị khóa.</p>
        <p style="font-size: 14px; color: #6b7280;">Hãy đảm bảo các đánh giá phản ánh đúng trải nghiệm của bạn.</p>
        <hr style="margin-top: 24px; border-top: 1px solid #fcd34d;" />
        <p style="font-size: 13px; color: #9ca3af; text-align: center;">Style For You - Hệ thống cảnh báo tự động.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Gửi email cảnh báo bom hàng
export const sendOrderSpamWarningEmail = async (to: string, name: string) => {
  const mailOptions = {
    from: `"Style For You" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Cảnh báo bom hàng - Style For You",
    html: `
      <div style="font-family: Arial; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #facc15; border-radius: 8px;">
        <h2 style="text-align: center; color: #ca8a04;">🚨 Cảnh báo bom hàng</h2>
        <p>Xin chào ${name},</p>
        <p>Hệ thống phát hiện bạn có hành vi đặt hàng nhưng không nhận hàng nhiều lần. Vui lòng xác nhận đơn hàng trong tương lai để tránh bị khóa tài khoản.</p>
        <p style="font-size: 13px; color: #9ca3af; text-align: center;">Style For You - Tôn trọng người bán hàng là tôn trọng chính bạn.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Gửi email tài khoản bị khóa
export const sendAccountBlockedEmail = async (to: string, name: string) => {
  const mailOptions = {
    from: `"Style For You" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Tài khoản bị khóa - Style For You",
    html: `
      <div style="font-family: Arial; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ef4444; border-radius: 8px;">
        <h2 style="text-align: center; color: #b91c1c;">🚫 Tài khoản bị khóa</h2>
        <p>Xin chào ${name},</p>
        <p>Tài khoản của bạn đã bị khóa do có nhiều hành vi vi phạm quy định.</p>
        <p style="font-size: 14px; color: #6b7280;">Nếu bạn cho rằng đây là nhầm lẫn, vui lòng liên hệ bộ phận hỗ trợ.</p>
        <hr style="margin: 24px 0; border-top: 1px solid #f87171;" />
        <p style="font-size: 13px; color: #9ca3af; text-align: center;">Style For You - Đảm bảo môi trường an toàn cho cộng đồng.</p>
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