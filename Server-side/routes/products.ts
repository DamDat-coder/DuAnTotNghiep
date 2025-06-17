import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  getAllProductsAdmin,
  getProductBySlug
} from "../controllers/productController";
import verifyToken from "../middlewares/verifyToken";
import verifyAdmin from "../middlewares/verifyAdmin";

const router = express.Router();

router.use(helmet());
router.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
}));

router.get("/", getAllProducts);
router.get("/admin", getAllProductsAdmin);
router.get("/:id", getProductById);
router.get('/slug/:slug', getProductBySlug);
router.post("/", verifyToken, verifyAdmin, createProduct);
router.patch("/:id", verifyToken, verifyAdmin,  updateProduct);

module.exports = router;