import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductBySlug
} from "../controllers/productController";
import verifyToken from "../middlewares/verifyToken";
import uploadToCloudinary from "../middlewares/cloudinaryUpload";
import verifyAdmin from "../middlewares/verifyAdmin";

const router = express.Router();

router.use(helmet());
router.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
}));

router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.get('/slug/:slug', getProductBySlug);
router.post("/", verifyToken, verifyAdmin, uploadToCloudinary, createProduct);
router.patch("/:id", verifyToken, verifyAdmin, uploadToCloudinary, updateProduct);
router.delete("/:id", verifyToken, verifyAdmin, deleteProduct);

export default router;