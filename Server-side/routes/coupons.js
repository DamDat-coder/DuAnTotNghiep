"use strict";
// routes/coupons.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const couponController_1 = require("../controllers/couponController");
const verifyToken_1 = __importDefault(require("../middlewares/verifyToken"));
const verifyAdmin_1 = __importDefault(require("../middlewares/verifyAdmin"));
const router = express_1.default.Router();
router.use((0, helmet_1.default)());
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
});
router.use(limiter);
router.get('/', couponController_1.getAllCoupons);
router.get('/:id', couponController_1.getCouponById);
router.post('/', verifyToken_1.default, verifyAdmin_1.default, couponController_1.createCoupon);
router.put('/:id', verifyToken_1.default, verifyAdmin_1.default, couponController_1.updateCoupon);
router.delete('/:id', verifyToken_1.default, verifyAdmin_1.default, couponController_1.deleteCoupon);
module.exports = router;
