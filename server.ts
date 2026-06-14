import app from "./app";
import { config } from "./src/config/env";
import { apiLimiter } from "./src/middleware/rateLimiter";
import { connectRedis } from "./src/utils/redis";
import { logger } from "./src/utils/logger";
(async () => {

  await connectRedis();
})();
app.use("/api", apiLimiter);
app.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`);
});