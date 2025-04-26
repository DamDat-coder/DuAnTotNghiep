import { Router } from "express";
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController";
import verifyToken from "../middlewares/verifyToken";
import verifyAdmin from "../middlewares/verifyAdmin";

const router = Router(); 

router.get("/", getAllCategories); 
router.get("/:id", getCategoryById);
router.post("/", verifyToken, verifyAdmin, createCategory);
router.put("/:id", verifyToken, verifyAdmin, updateCategory);
router.delete("/:id", verifyToken, verifyAdmin, deleteCategory);


module.exports = router;
