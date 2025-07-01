"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const review_controller_1 = require("../controllers/review.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
router.post("/", auth_middleware_1.verifyToken, review_controller_1.createReview);
router.get("/product/:productId", review_controller_1.getProductReviews);
router.get("/", auth_middleware_1.verifyToken, auth_middleware_1.verifyAdmin, review_controller_1.getAllReviews);
router.put("/:id/status", auth_middleware_1.verifyToken, auth_middleware_1.verifyAdmin, review_controller_1.updateReviewStatus);
exports.default = router;
