import { redisClient } from "../utils/redis";

export async function getCache(key: string){

const cacheMessage = await redisClient.get(key);

  return cacheMessage ? JSON.parse(cacheMessage) : null;
}

export async function setCache(key: string, value: any) {
  await redisClient.set(key, JSON.stringify(value), {
    EX: 60 * 5, // 5 minutes
  });
}