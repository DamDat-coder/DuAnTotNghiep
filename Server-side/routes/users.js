"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const verifyToken_1 = __importDefault(require("../middlewares/verifyToken"));
const router = (0, express_1.Router)();
// Public routes
router.post("/register", userController_1.register);
router.post("/register", userController_1.register);
router.post("/login", userController_1.login);
router.post("/refresh", userController_1.refresh);
// Protected routes
router.get("/userinfo", verifyToken_1.default, userController_1.getUser);
router.get("/", userController_1.getAllUser);
router.put("/update", verifyToken_1.default, userController_1.updateUser);
router.put("/update", verifyToken_1.default, userController_1.updateUser);
router.delete("/delete", verifyToken_1.default, userController_1.deleteUser);
// Xuất CommonJS thay vì export default
module.exports = router;
