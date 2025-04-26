import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import {
  addPro,
  deletePro,
  editPro,
  getAllProducts,
  getProductById,
} from "../controllers/productController";
import verifyToken from "../middlewares/verifyToken";
import verifyAdmin from "../middlewares/verifyAdmin";

const router = express.Router();

router.use(helmet());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
router.use(limiter);

router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.post("/", verifyToken, verifyAdmin, addPro);
router.patch("/:id", verifyToken, verifyAdmin, editPro);
router.delete("/:id", verifyToken, verifyAdmin, deletePro);

module.exports = router;
