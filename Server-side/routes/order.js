"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const orderController_1 = require("../controllers/orderController");
const verifyToken_1 = __importDefault(require("../middlewares/verifyToken"));
const router = express_1.default.Router();
router.use((0, helmet_1.default)());
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
});
router.use(limiter);
// USER: Xem tất cả đơn của mình
router.get("/user/orders", verifyToken_1.default, orderController_1.getUserOrders);
// USER: Tạo đơn mới
router.post("/", verifyToken_1.default, orderController_1.createOrder);
// USER: Xem chi tiết đơn của mình
router.get("/:id", verifyToken_1.default, orderController_1.getOrderById);
// ------- BỔ SUNG CHO ADMIN --------
const verifyAdmin_1 = __importDefault(require("../middlewares/verifyAdmin"));
const orderController_2 = require("../controllers/orderController");
// ADMIN: Xem tất cả đơn hàng
router.get('/', verifyToken_1.default, verifyAdmin_1.default, orderController_2.getAllOrders);
// ADMIN: Xem tất cả đơn theo userId bất kỳ
router.get('/user/:userId', verifyToken_1.default, verifyAdmin_1.default, orderController_2.getOrdersByUserId);
// ADMIN: Cập nhật trạng thái đơn hàng
router.patch('/:id', verifyToken_1.default, verifyAdmin_1.default, orderController_2.updateOrderStatus);
exports.default = router;
