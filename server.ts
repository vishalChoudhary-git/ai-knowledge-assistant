import app from "./app";
import { config } from "./src/config/env";
import { apiLimiter } from "./src/middleware/rateLimiter";
import { connectRedis } from "./src/utils/redis";

(async () => {

  await connectRedis();
})();
app.use("/api", apiLimiter);
app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});