import rateLimit from "express-rate-limit";

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 20,             // 20 requests per minute
  message: "Too many requests, please try again later",
});