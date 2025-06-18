"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
// import verifyToken from "../middlewares/verifyToken";
// import verifyAdmin from "../middlewares/verifyAdmin";
const router = (0, express_1.Router)();
// Public
router.post("/register", userController_1.register);
router.post("/login", userController_1.login);
router.post("/refresh", userController_1.refresh);
// Người dùng đăng nhập
router.get("/me", /*verifyToken,*/ userController_1.getUser); // bỏ verifyToken
router.put("/update", /*verifyToken,*/ userController_1.updateUser);
router.delete("/delete", /*verifyToken,*/ userController_1.disableUser);
router.get("/userinfo", /*verifyToken,*/ userController_1.getUser);
// Admin
router.get("/", /*verifyToken, verifyAdmin,*/ userController_1.getAllUser);
module.exports = router;
