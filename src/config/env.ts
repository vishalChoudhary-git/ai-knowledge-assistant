import dotenv from 'dotenv';
dotenv.config();

export const config = {
  openAiKey: process.env.OPENAI_API_KEY!,
  redisUrl: process.env.REDIS_CONNECTION_STRING!,
  chromaHost: process.env.CHROMA_HOST!,
  chromaPort: process.env.CHROMA_PORT!,
  chromaSsl: process.env.CHROMA_SSL === 'true',
  port: process.env.PORT || 3000,
  allowedOrigins: process.env.ALLOWED_ORIGINS
    ?.split(",")
    .map(origin => origin.trim()) || [],
};