import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController";
import verifyToken from "../middlewares/verifyToken";
import { upload } from "../utils/fileUpload";
import verifyAdmin from "../middlewares/verifyAdmin";

const router = express.Router();

router.use(helmet());
router.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
}));

router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.post("/", verifyToken, verifyAdmin, upload.array("image"), createProduct);
router.patch("/:id", verifyToken, verifyAdmin, upload.array("image"), updateProduct);
router.delete("/:id", verifyToken, verifyAdmin, deleteProduct);

export default router;