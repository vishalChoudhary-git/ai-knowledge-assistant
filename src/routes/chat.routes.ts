import { Router } from "express";
import { chatHandler, chatStreamHandler } from "../controllers/chat.controller";

const router = Router();

router.post("/chat", chatHandler);
router.post("/chat/stream", chatStreamHandler);
export default router;