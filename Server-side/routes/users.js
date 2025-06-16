"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const verifyToken_1 = __importDefault(require("../middlewares/verifyToken"));
const verifyAdmin_1 = __importDefault(require("../middlewares/verifyAdmin"));
const router = (0, express_1.Router)();
// Public
router.post("/register", userController_1.register);
router.post("/login", userController_1.login);
router.post("/refresh", userController_1.refresh);
// Người dùng đăng nhập
router.get("/me", verifyToken_1.default, userController_1.getUser);
router.put("/update", verifyToken_1.default, userController_1.updateUser);
router.delete("/delete", verifyToken_1.default, userController_1.disableUser);
// Admin
router.get("/", verifyToken_1.default, verifyAdmin_1.default, userController_1.getAllUser);
module.exports = router;
