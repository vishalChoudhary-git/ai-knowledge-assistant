import { Router } from "express";
import multer from "multer";
import { uploadDocumentHandler, ragQueryHandler, getSourcesHandler } from "../controllers/rag.controller";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/rag/upload", upload.single("file"), uploadDocumentHandler);
router.post("/rag/query", ragQueryHandler);
router.get("/rag/sources", getSourcesHandler);

export default router;