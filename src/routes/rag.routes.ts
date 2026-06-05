import { Router } from "express";
import { uploadDocumentHandler, ragQueryHandler } from "../controllers/rag.controller";

const router = Router();

router.post("/rag/upload", uploadDocumentHandler);
router.post("/rag/query", ragQueryHandler);

export default router;