import { Router } from "express";
import {
  createCategory,
  getCategoryTree,
  getCategoryById,
  updateCategory,
  deleteCategory
} from "../controllers/category.controller";
import { upload } from "../middlewares/upload.middleware";
import { verifyToken, verifyAdmin } from "../middlewares/auth.middleware";

const router = Router();

router.get("/tree", getCategoryTree);
router.get("/:id", verifyToken, verifyAdmin, getCategoryById);
router.post("/", verifyToken, verifyAdmin, upload.single("image"), createCategory);
router.put("/:id", verifyToken, verifyAdmin, upload.single("image"), updateCategory);
router.delete("/:id", verifyToken, verifyAdmin, deleteCategory);

export default router;
