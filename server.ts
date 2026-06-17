import app from "./app";
import { config } from "./src/config/env";
import { apiLimiter } from "./src/middleware/rateLimiter";
import { connectRedis } from "./src/utils/redis";
import { logger } from "./src/utils/logger";
(async () => {

  await connectRedis();
})();
app.use("/api", apiLimiter);
console.log("PORT:", process.env.PORT);
console.log("config.port:", config.port);
app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port}`);
});