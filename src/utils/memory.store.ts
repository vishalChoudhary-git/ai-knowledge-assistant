import { setCache } from "../services/cache.service";
import { LIMITS } from "./constants";
import { redisClient } from "./redis";
import { CACHE_TTL } from "../config/cache";
type Role = 'user' | 'assistant'

interface Message {
  role: Role;
  content: string;
}


export async function getMemory(memoryKey: string): Promise<Message[]>{
  const data: any = await redisClient.get(memoryKey);
  return data ? JSON.parse(data) : [];;
}

export async function addToMemory(memoryKey: string, message: Message){
  const existing = await getMemory(memoryKey);

  const updated = [...existing,message].slice(- LIMITS.MAX_MESSAGES);

  
 await redisClient.set(memoryKey, JSON.stringify(updated),{
  EX: CACHE_TTL.CHAT_MEMORY,
 });
}
