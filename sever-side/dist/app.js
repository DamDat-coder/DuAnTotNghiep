"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const category_routes_1 = __importDefault(require("./routes/category.routes"));
const news_routes_1 = __importDefault(require("./routes/news.routes"));
const coupon_routes_1 = __importDefault(require("./routes/coupon.routes"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const error_middleware_1 = require("./middlewares/error.middleware");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: "http://localhost:3300",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
app.use("/api/users", user_routes_1.default);
app.use("/api/products", product_routes_1.default);
app.use("/api/news", news_routes_1.default);
app.use("/api/coupons", coupon_routes_1.default);
app.use("/api/categories", category_routes_1.default);
app.use("/api/orders", order_routes_1.default);
app.use(error_middleware_1.errorHandler);
exports.default = app;
