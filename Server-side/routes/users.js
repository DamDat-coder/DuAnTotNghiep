const express = require("express");
const router = express.Router();
const { register, login, verifyToken, getUser, refresh } = require("../controllers/userController");

router.post("/register", register);
router.post("/login", login);
router.get("/userinfo", verifyToken, getUser);
router.post("/refresh", refresh);

module.exports = router;