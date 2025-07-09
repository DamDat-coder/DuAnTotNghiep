import express from "express";
import cors from "cors";
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
import reviewRoutes from './routes/review.routes';
import notificationRoutes from "./routes/notification.routes";
import { errorHandler } from "./middlewares/error.middleware";
dotenv.config();

const app = express();
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau."
});
app.use(limiter);
app.use(xss());
app.use(hpp());
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = ["http://localhost:3300"];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/coupons", couponRouters);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);
app.use(errorHandler);

export default app;