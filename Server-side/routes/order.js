"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const verifyToken_1 = __importDefault(require("../middlewares/verifyToken"));
const orderController_1 = require("../controllers/orderController");
const router = express_1.default.Router();
// Security
router.use((0, helmet_1.default)());
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
});
router.use(limiter);
// Lấy danh sách đơn của user (user đăng nhập)
router.get("/user/orders", verifyToken_1.default, orderController_1.getUserOrders);
// Lấy tất cả đơn hàng (chỉ admin)
router.get("/", verifyToken_1.default, /*verifyAdmin,*/ orderController_1.getAllOrders);
// Tạo mới đơn hàng
router.post("/", verifyToken_1.default, orderController_1.createOrder);
// Lấy chi tiết đơn hàng theo ID
router.get("/:id", verifyToken_1.default, orderController_1.getOrderById);
// Cập nhật đơn hàng (admin)
router.patch("/:id", verifyToken_1.default, /*verifyAdmin,*/ orderController_1.updateOrderStatus);
module.exports = router;
