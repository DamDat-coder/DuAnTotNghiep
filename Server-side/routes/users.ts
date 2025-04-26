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
import { upload } from "../utils/fileUpload";

const router = Router();

// Public routes
router.post("/register", upload.single("avatar"), register);
router.post("/login", login);
router.post("/refresh", refresh);

// Protected routes
router.get("/userinfo", verifyToken, getUser);
router.get("/", verifyToken, verifyAdmin, getAllUser);
router.put("/update", verifyToken, upload.single("avatar"), updateUser);
router.delete("/delete", verifyToken, deleteUser);

// Xuất CommonJS thay vì export default
module.exports = router;
