import express from "express";
import cors from "cors";
import chatRoutes from "./src/routes/chat.routes";
import ragRoutes from "./src/routes/rag.routes";
import { errorHandler } from "./src/middleware/errors.middleware";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/v1", chatRoutes);
app.use("/api/v2", ragRoutes);
app.use(errorHandler);

export default app;