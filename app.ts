import express from "express";
import cors from "cors";
import chatRoutes from "./src/routes/chat.routes";
import ragRoutes from "./src/routes/rag.routes";
import { errorHandler } from "./src/middleware/errors.middleware";
import { config } from "./src/config/env";
import healthRoutes from "./src/routes/health.routes";
import { apiLimiter } from "./src/middleware/rateLimiter";

const app = express();

app.use(  cors({
    origin(origin, callback) {
      // Allow Postman / curl / server-to-server requests
      if (!origin) {
        return callback(null, true);
      }

      if (config.allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      callback(new Error("CORS not allowed"));
    },
    credentials: true,
  }));
app.use(express.json());
app.use("/api/v2", healthRoutes);
app.use("/api/v1", apiLimiter, chatRoutes);
app.use("/api/v2", apiLimiter, ragRoutes);
app.use(errorHandler);

export default app;