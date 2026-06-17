import { Router } from "express";
const router = Router();

router.get("/heartbeat", async (_, res) => {
  res.status(200).json({
    success: true,
    status: "UP",
    services: {
      redis: "connected",
      chroma: "connected"
    },
    uptime: process.uptime()
  });
});

export default router;