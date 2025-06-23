import { Router } from "express";
import {
  register,
  login,
  refresh,
  getUser,
  updateUser,
  disableUser,
  getAllUser,
} from "../controllers/userController";
import verifyToken from "../middlewares/verifyToken";
// import verifyAdmin from "../middlewares/verifyAdmin";

const router = Router();

// Public
router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);

// Người dùng đăng nhập
router.get("/me", verifyToken, getUser);
router.put("/update", verifyToken, updateUser);
router.delete("/delete", verifyToken, disableUser );
router.get("/userinfo", verifyToken, getUser);

// Admin
router.get("/", /*verifyToken, verifyAdmin,*/ getAllUser);

module.exports = router;
