import { retrieveContext, storeDocument } from "../services/vector.service";
import { buildRagPrompt } from "../utils/prompt.builder";
import type { NextFunction, Request, Response } from "express";
import { openai } from "../config/openai";
import { addToMemory, getMemory } from "../utils/memory.store";
import { buildEnhancedQuery } from "../utils/query.util";

export const uploadDocumentHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { text, source } = req.body;

    if (!text || text.length < 20) {
      return res.status(400).json({ error: "Invalid document text" });
    }

    await storeDocument(text, source);

    res.json({
      success: true,
      message: "Document stored successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const ragQueryHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message, source, sessionId, stream = false} = req.body;
    const history = await getMemory(sessionId);
    const enhancedQuery = buildEnhancedQuery(message, history);
    const contextChunks = await retrieveContext(enhancedQuery, source) as string[];

    const messageToLLM = buildRagPrompt(message, contextChunks)
   // 🔥 STREAM MODE
    if (stream) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      res.flushHeaders?.();

      const streamRes = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: messageToLLM,
        stream: true,
        temperature: 0.7,
        max_tokens: 200,
      });

      let fullResponse = "";

      for await (const chunk of streamRes) {
        const content = chunk.choices[0]?.delta?.content;

        if (content) {
          fullResponse += content;
          res.write(`data: ${content}\n\n`);
        }
      }
      res.write(`data: ${JSON.stringify({ type: "sources", data: contextChunks })}\n\n`);      
      res.write("data: [DONE]\n\n");
      res.end();

      // 🔥 store memory AFTER stream completes
      await addToMemory(sessionId, { role: "user", content: message });
      await addToMemory(sessionId, { role: "assistant", content: fullResponse });

      return;
    }
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 150,
      temperature: 0.7,
      messages: messageToLLM
    });
    await addToMemory(sessionId, {
  role: "user",
  content: message,
});

await addToMemory(sessionId, {
  role: "assistant",
  content: response.choices[0].message.content as string,
});
    res.json({
      success: true,
      data: response.choices[0].message.content,
      contextUsed: contextChunks, // 🔥 helpful for debugging
    });
  } catch (err) {
    next(err);
  }
}

