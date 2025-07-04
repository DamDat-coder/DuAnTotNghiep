import express from "express";
import { getMyNotifications, markNotificationAsRead } from "../controllers/notification.controller";
import { verifyToken } from "../middlewares/auth.middleware";

const router = express.Router();

router.get("/me", verifyToken, getMyNotifications);
router.patch("/:id/read", verifyToken, markNotificationAsRead);

export default router;
