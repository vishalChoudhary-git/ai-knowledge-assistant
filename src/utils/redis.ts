import {createClient } from "redis";
import { config } from "../config/env";
export const redisClient = createClient({
  url: config.redisUrl,
});

redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

export async function connectRedis() {
  
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log("Redis connected");
  }
}