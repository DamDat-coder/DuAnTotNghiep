import { Router } from "express";
import {
    createNews,
    updateNews,
    deleteNews,
    getNewsList,
    getNewsDetail,
} from "../controllers/newsController";
import verifyToken from "../middlewares/verifyToken";
import verifyAdmin from "../middlewares/verifyAdmin";

const router = Router();


router.get("/", getNewsList);
router.get("/:id", getNewsDetail);
router.post("/", verifyToken, verifyAdmin, createNews);
router.put("/:id", verifyToken, verifyAdmin, updateNews);
router.delete("/:id", verifyToken, verifyAdmin, deleteNews);

export default router;