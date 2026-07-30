import { retrieveContext, storeDocument, listSources } from "../services/vector.service";
import { buildRagPrompt } from "../utils/prompt.builder";
import type { NextFunction, Request, Response } from "express";
import { openai } from "../config/openai";
import { addToMemory, getMemory } from "../utils/memory.store";
import { buildEnhancedQuery } from "../utils/query.util";
import { redisClient } from "../utils/redis";
import pdfParse from "pdf-parse";

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

async function extractFileText(req: MulterRequest): Promise<string> {
  const file = req.file;

  if (!file) {
    throw new Error("No file uploaded");
  }

  if (file.mimetype === "application/pdf") {
    const data = await pdfParse(file.buffer);
    return data.text;
  }

  if (file.mimetype === "text/plain") {
    return file.buffer.toString("utf-8");
  }

  throw new Error("Unsupported file type. Please upload a PDF or TXT file.");
}

export const uploadDocumentHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const source = req.body.source;
    let text = "";

    if (req.is("application/json")) {
      text = req.body.text;
    } else {
      text = await extractFileText(req);
    }

    if (!source || typeof source !== "string") {
      return res.status(400).json({ error: "Missing source" });
    }

    if (!text || text.length < 20) {
      return res.status(400).json({ error: "Invalid document text" });
    }

    await storeDocument(text, source);
    await redisClient.sAdd("rag:sources", JSON.stringify(source));

    res.json({
      success: true,
      message: "Document stored successfully",
    });
  } catch (err: any) {
    if (err.message === "No file uploaded" || err.message.includes("Unsupported file type")) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
};

export const getSourcesHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let sources = await redisClient.sMembers("rag:sources");
    const validSources = sources.filter(
      (source) => typeof source === "string" && source.trim() !== "" && source !== "[object Object]"
    );

    if (validSources.length !== sources.length) {
      const invalid = sources.filter((source) => !validSources.includes(source));
      for (const item of invalid) {
        await redisClient.sRem("rag:sources", item);
      }
      sources = validSources;
    }

    if (sources.length === 0) {
      sources = await listSources();
      if (sources.length > 0) {
        for (const item of sources) {
          await redisClient.sAdd("rag:sources", item);
        }
      }
    }

    res.json({ success: true, data: sources });
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

