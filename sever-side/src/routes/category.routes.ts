import { Router } from "express";
import {
  createCategory,
  getCategoryTree,
  getCategoryById,
  updateCategory,
  toggleActiveCategory,

} from "../controllers/category.controller";
import { upload } from "../middlewares/upload.middleware";
import { verifyToken, verifyAdmin } from "../middlewares/auth.middleware";

const router = Router();

router.get("/tree", getCategoryTree);
router.patch("/:id/lock", verifyToken, verifyAdmin, toggleActiveCategory);
router.get("/:id", verifyToken, verifyAdmin, getCategoryById);
router.post("/", verifyToken, verifyAdmin, upload.single("image"), createCategory);
router.put("/:id", verifyToken, verifyAdmin, upload.single("image"), updateCategory);
router.patch("/:id/lock", verifyToken, verifyAdmin, toggleActiveCategory);

export default router;
