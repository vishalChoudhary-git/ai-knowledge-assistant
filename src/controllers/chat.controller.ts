import { Request, Response, NextFunction } from "express";
import { generateChatResponse,streamChatResponse } from "../services/llm.service";
import { validateMessage as validateRequest } from "../utils/validator";
import { addToMemory, getMemory } from "../utils/memory.store";
import { logger } from "../utils/logger";
function compressText(text: string): string {
  return text.length > 300 ? text.slice(0, 300) : text;
}
export const chatHandler = async(req: Request,res: Response, next: NextFunction ) => {

try {
  const sessionId = req.body.sessionId;
  const memoryKey = `memory:${sessionId}`
  const validatedMessage = validateRequest(req.body.message);
  if(!sessionId)
    return res.status(400).json({ error: "sessionId required" }); 
  const history = await getMemory(memoryKey);
  
  const reply =await generateChatResponse(validatedMessage,history,sessionId);
    // store user + assistant messages
   await addToMemory(memoryKey, { role: "user", content: validatedMessage });
   await addToMemory(memoryKey, { role: "assistant", content: compressText(reply) });
  res.json({
    success: true,
    data: reply
  })  
} catch (error) {
  
  logger.error(`error: ${error}`);
  next(error)
}

}

export const chatStreamHandler = async (req: Request,res: Response, next: NextFunction ) => {

  try {
      const validatedMessage = validateRequest(req.body.message);
// | Header       | Purpose              |
// | ------------ | -------------------- |
// | event-stream | Enable streaming     |
// | no-cache     | Prevent stale data   |
// | keep-alive   | Keep connection open |

  //SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
    // 🔥 Flush headers early Sends headers immediately -> Sometimes headers wait until first chunk
    res.flushHeaders?.();
        // 🔥 Handle client disconnect
    req.on("close", () => {
      logger.info("Client disconnected");
    });
    if(!req.body.sessionId)
    return res.status(400).json({ error: "sessionId required" }); 
  await streamChatResponse(validatedMessage, res,req.body.sessionId);

  } catch (error) {
    next(error);
  }
}