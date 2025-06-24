"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const news_controller_1 = require("../controllers/news.controller");
const multer_1 = __importDefault(require("multer"));
const router = express_1.default.Router();
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
router.post('/', upload.array('images', 10), news_controller_1.createNews);
router.put('/:id', upload.array('images', 10), news_controller_1.updateNews);
router.delete('/:id', news_controller_1.deleteNews);
router.get('/', news_controller_1.getNewsList);
router.get('/:id', news_controller_1.getNewsDetail);
exports.default = router;
