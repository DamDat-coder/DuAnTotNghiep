const express = require("express");
const router = express.Router();
const {
  register,
  login,
  verifyToken,
  verifyAdmin,
  getUser,
  refresh,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

router.post("/register", register);
router.post("/login", login);
router.get("/userinfo", verifyToken, getUser);
router.post("/refresh", verifyToken, verifyAdmin, refresh);
router.put("/update", verifyToken, verifyAdmin, updateUser);
router.delete("/delete", verifyToken, verifyAdmin, deleteUser);

module.exports = router;
