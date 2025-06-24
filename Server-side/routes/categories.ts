import { Router } from "express";
import {
  getAllCategoriesFlat,
  getParentCategories,
  getChildCategories,
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController";
import verifyToken from "../middlewares/verifyToken";
import verifyAdmin from "../middlewares/verifyAdmin";

const router = Router();

router.get("/all/flat", getAllCategoriesFlat);
router.get("/parents", getParentCategories);
router.get("/children/:parentId", getChildCategories);
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);
router.post("/", verifyToken, verifyAdmin, createCategory);
router.put("/:id", verifyToken, verifyAdmin, updateCategory);
router.delete("/:id", verifyToken, verifyAdmin, deleteCategory);

module.exports = router;
