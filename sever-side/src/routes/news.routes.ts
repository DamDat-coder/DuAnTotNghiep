import express from "express";
import {
  createNews,
  updateNews,
  deleteNews,
  getNewsList,
  getNewsDetail,
} from "../controllers/news.controller";
import { verifyToken, verifyAdmin } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/upload.middleware"; 

const router = express.Router();

router.post("/", verifyToken, upload.array("images", 10), createNews);
router.put("/:id", verifyToken, upload.array("images", 10), updateNews);
router.delete("/:id", verifyToken, verifyAdmin, deleteNews);
router.get("/", getNewsList);
router.get("/:id", getNewsDetail);

export default router;
