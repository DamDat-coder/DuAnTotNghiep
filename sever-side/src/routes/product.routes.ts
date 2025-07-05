import express from "express";
import {
  createProduct,
  getAllProducts,
  getAllProductsAdmin,
  getProductById,
  getProductBySlug,
  updateProduct,
  lockProduct,
} from "../controllers/product.controller";
import { verifyToken, verifyAdmin } from "../middlewares/auth.middleware";
import {
  validateCreateProduct,
  validateUpdateProduct,
  validateLockProduct,
} from "../middlewares/validators/product.validator";
import multer from "multer";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/admin", verifyToken, verifyAdmin, getAllProductsAdmin);
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.get("/slug/:slug", getProductBySlug);

router.post(
  "/",
  upload.array("images", 20),
  verifyToken,
  verifyAdmin,
  validateCreateProduct,
  createProduct
);

router.put(
  "/:id",
  upload.array("images", 20),
  verifyToken,
  verifyAdmin,
  validateUpdateProduct,
  updateProduct
);

router.patch("/:id/lock", verifyToken, verifyAdmin, validateLockProduct, lockProduct);

export default router;
