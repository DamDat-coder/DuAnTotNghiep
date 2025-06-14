"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const productController_1 = require("../controllers/productController");
const verifyToken_1 = __importDefault(require("../middlewares/verifyToken"));
const fileUpload_1 = require("../utils/fileUpload");
const verifyAdmin_1 = __importDefault(require("../middlewares/verifyAdmin"));
const router = express_1.default.Router();
router.use((0, helmet_1.default)());
router.use((0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
}));
router.get("/", productController_1.getAllProducts);
router.get("/:id", productController_1.getProductById);
router.post("/", verifyToken_1.default, verifyAdmin_1.default, fileUpload_1.upload.array("image"), productController_1.createProduct);
router.patch("/:id", verifyToken_1.default, verifyAdmin_1.default, fileUpload_1.upload.array("image"), productController_1.updateProduct);
router.delete("/:id", verifyToken_1.default, verifyAdmin_1.default, productController_1.deleteProduct);
exports.default = router;
