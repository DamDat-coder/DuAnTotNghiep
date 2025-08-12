"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const xss_clean_1 = __importDefault(require("xss-clean"));
const hpp_1 = __importDefault(require("hpp"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const compression_1 = __importDefault(require("compression"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const category_routes_1 = __importDefault(require("./routes/category.routes"));
const news_routes_1 = __importDefault(require("./routes/news.routes"));
const coupon_routes_1 = __importDefault(require("./routes/coupon.routes"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const payment_routers_1 = __importDefault(require("./routes/payment.routers"));
const review_routes_1 = __importDefault(require("./routes/review.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const address_routes_1 = __importDefault(require("./routes/address.routes"));
const error_middleware_1 = require("./middlewares/error.middleware");
require("./jobs/cron");
require("./jobs/notifyFreeship.job");
const app = (0, express_1.default)();
/** ---------- Hardening & middlewares cơ bản ---------- */
app.set("trust proxy", 1);
app.use((0, helmet_1.default)({ crossOriginResourcePolicy: false }));
app.use((0, xss_clean_1.default)());
app.use((0, hpp_1.default)());
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
app.use((0, cookie_parser_1.default)());
/** ---------- CORS (dev + prod) ---------- */
const normalize = (s) => (s ? s.replace(/\/+$/, "") : s);
const defaultAllowed = [
    "http://localhost:3300",
    "http://styleforyou.online",
    "https://styleforyou.online",
    "http://www.styleforyou.online",
    "https://www.styleforyou.online",
    "http://103.106.104.87:3300", // BỎ dấu / cuối
].map(normalize);
const allowedFromEnv = ((_a = process.env.CORS_ORIGINS) !== null && _a !== void 0 ? _a : "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map(normalize);
const ORIGINS = allowedFromEnv.length > 0 ? allowedFromEnv : defaultAllowed;
const corsOptions = {
    origin(origin, cb) {
        const o = normalize(origin);
        if (!origin || ORIGINS.includes(o))
            return cb(null, true);
        return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};
app.use((0, cors_1.default)(corsOptions));
app.options("*", (0, cors_1.default)(corsOptions));
/** ---------- Rate limit ---------- */
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.",
});
app.use((req, res, next) => {
    if (req.method === "OPTIONS")
        return next();
    return limiter(req, res, next);
});
/** ---------- Routes ---------- */
app.use("/api/users", user_routes_1.default);
app.use("/api/products", product_routes_1.default);
app.use("/api/news", news_routes_1.default);
app.use("/api/coupons", coupon_routes_1.default);
app.use("/api/categories", category_routes_1.default);
app.use("/api/orders", order_routes_1.default);
app.use("/api/payment", payment_routers_1.default);
app.use("/api/reviews", review_routes_1.default);
app.use("/api/notifications", notification_routes_1.default);
app.use("/api/address", address_routes_1.default);
// Health-check
app.get("/api/health", (_req, res) => {
    res.json({
        ok: true,
        env: process.env.NODE_ENV || "development",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});
/** ---------- 404 & Error handler ---------- */
app.use((_req, res) => {
    res.status(404).json({ message: "Route not found" });
});
app.use(error_middleware_1.errorHandler);
exports.default = app;
