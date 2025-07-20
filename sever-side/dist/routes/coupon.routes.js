"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const coupon_controller_1 = require("../controllers/coupon.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
router.get("/", coupon_controller_1.getAllCoupons);
router.get("/:id", coupon_controller_1.getCouponById);
router.post("/", auth_middleware_1.verifyToken, auth_middleware_1.verifyAdmin, coupon_controller_1.createCoupon);
router.put("/:id", auth_middleware_1.verifyToken, auth_middleware_1.verifyAdmin, coupon_controller_1.updateCoupon);
router.put("/hide/:id", auth_middleware_1.verifyToken, auth_middleware_1.verifyAdmin, coupon_controller_1.hideCoupon);
exports.default = router;
