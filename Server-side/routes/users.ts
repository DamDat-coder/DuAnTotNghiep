import { Router } from "express";
import {
  register,
  login,
  refresh,
  getUser,
  getAllUser,
  updateUser,
  deleteUser,
} from "../controllers/userController";
import verifyToken from "../middlewares/verifyToken";
import verifyAdmin from "../middlewares/verifyAdmin";



const router = Router();

// Public routes
router.post("/register", register);
router.post("/register",  register);
router.post("/login", login);
router.post("/refresh", refresh);

// Protected routes
router.get("/userinfo", verifyToken, getUser);
router.get("/", getAllUser);
router.put("/update", verifyToken, updateUser);
router.put("/update", verifyToken, updateUser);
router.delete("/delete", verifyToken, deleteUser);

// Xuất CommonJS thay vì export default
module.exports = router;
