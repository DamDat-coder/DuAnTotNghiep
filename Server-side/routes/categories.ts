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

router.get("/all/flat", getAllCategoriesFlat);           // Tất cả (phẳng)
router.get("/parents", getParentCategories);             // Danh mục cha
router.get("/children/:parentId", getChildCategories);   // Danh mục con
router.get("/", getAllCategories);                       // Cha hoặc con theo ?parentId=xxx
router.get("/:id", getCategoryById);
router.post("/", verifyToken, verifyAdmin, createCategory);
router.put("/:id", verifyToken, verifyAdmin, updateCategory);
router.delete("/:id", verifyToken, verifyAdmin, deleteCategory);

module.exports = router;