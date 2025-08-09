import express from "express";
import cors, { CorsOptions } from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import xss from "xss-clean";
import hpp from "hpp";

import userRoutes from "./routes/user.routes";
import productRoutes from "./routes/product.routes";
import categoryRoutes from "./routes/category.routes";
import newsRoutes from "./routes/news.routes";
import couponRouters from "./routes/coupon.routes";
import orderRoutes from "./routes/order.routes";
import paymentRoutes from "./routes/payment.routers";
import reviewRoutes from "./routes/review.routes";
import notificationRoutes from "./routes/notification.routes";
import addressRoutes from "./routes/address.routes";

import { errorHandler } from "./middlewares/error.middleware";
import "./jobs/cron";
import "./jobs/notifyFreeship.job";

dotenv.config();

const app = express();

/** Rate limit */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau."
});
app.use(limiter);

/** Hardening */
app.use(xss());
app.use(hpp());
app.set("trust proxy", 1);
app.use(
  helmet({
    crossOriginResourcePolicy: false, // tránh chặn ảnh/static nếu có
  })
);

/** Logger & body */
app.use(morgan("dev"));
app.use(express.json());

/** ========= CORS cấu hình đúng cho dev + prod =========
 * CORS_ORIGINS có dạng danh sách, phân tách bằng dấu phẩy.
 * Ví dụ PRODUCTION:
 * CORS_ORIGINS=http://styleforyou.online,https://styleforyou.online,http://www.styleforyou.online,https://www.styleforyou.online
 * Ví dụ DEVELOPMENT:
 * CORS_ORIGINS=http://localhost:3300
 */
const defaultAllowed = [
  "http://localhost:3300",
  "http://styleforyou.online",
  "https://styleforyou.online",
  "http://www.styleforyou.online",
  "https://www.styleforyou.online",
];

const allowedOrigins = (process.env.CORS_ORIGINS ?? "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

const ORIGINS = allowedOrigins.length > 0 ? allowedOrigins : defaultAllowed;

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    // Cho phép:
    // - Request không có Origin (server-to-server, Postman, cron...)
    // - Origin nằm trong whitelist
    if (!origin || ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));
// Preflight cho mọi route
app.options("*", cors(corsOptions));

/** ========= Routes ========= */
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/coupons", couponRouters);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/address", addressRoutes);

// (tuỳ chọn) endpoint health-check
app.get("/api/health", (_req, res) => res.json({ ok: true }));

/** Error handler cuối cùng */
app.use(errorHandler);

export default app;
