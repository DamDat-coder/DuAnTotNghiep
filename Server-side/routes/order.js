
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
router.get("/user/orders", verifyToken_1.default, orderController_1.getUserOrders);
router.post("/", verifyToken_1.default, orderController_1.createOrder);
router.get("/:id", verifyToken_1.default, orderController_1.getOrderById);
module.exports = router;

