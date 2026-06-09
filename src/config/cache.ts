// export const CACHE_TTL = {
//   CHAT_RESPONSE: 60 * 60 * 24,      // 24 hours
//   CHAT_MEMORY: 60 * 30,             // 30 minutes
//   SEMANTIC_CACHE: 60 * 60 * 24 * 7, // 7 days
// } as const;

export const CACHE_TTL = {
  CHAT_RESPONSE: 60 * 60 * 1,      // 1 hour
  CHAT_MEMORY: 60 * 10,             // 10 minutes
  SEMANTIC_CACHE: 60 * 60 * 24 * 7, // 7 days
} as const;