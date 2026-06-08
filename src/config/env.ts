import dotenv from 'dotenv';
dotenv.config();

export const config = {
  openAiKey: process.env.OPENAI_API_KEY!,
  redisUrl: process.env.REDIS_CONNECTION_STRING!,
  chromaUrl: process.env.CHROMA_URL!,
  PORT: process.env.PORT || 3000,
};