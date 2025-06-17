"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const newsController_1 = require("../controllers/newsController");
const verifyToken_1 = __importDefault(require("../middlewares/verifyToken"));
const verifyAdmin_1 = __importDefault(require("../middlewares/verifyAdmin"));
const router = (0, express_1.Router)();
router.get("/", newsController_1.getNewsList);
router.get("/:id", newsController_1.getNewsDetail);
router.post("/", verifyToken_1.default, verifyAdmin_1.default, newsController_1.createNews);
router.put("/:id", verifyToken_1.default, verifyAdmin_1.default, newsController_1.updateNews);
router.delete("/:id", verifyToken_1.default, verifyAdmin_1.default, newsController_1.deleteNews);
exports.default = router;
