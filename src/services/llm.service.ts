import { openai } from "../config/openai";
import { buildChatPrompt } from "../utils/prompt.builder";
import { Response } from "express";
import { getCache, setCache } from "./cache.service";
import { createHash } from "../utils/hash.util";
import { searchVector,storeVector } from "./vector.service";
function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "") // remove punctuation
    .trim();
}
function getMaxTokens(message: string) {
  if (message.length < 50) return 100;
  if (message.length < 100) return 150;
  return 200;
}
export async function generateChatResponse(message: string, history: any,sessionId: string   ): Promise<string> {
  const normalizedMessage = normalize(message);
    // 🔥 create hash Accuracy high Cache Hit lower
  const hashInput = JSON.stringify({
  normalizedMessage,
  //history: history.slice(-2), // last 2 messages only
});

  const hash = createHash(hashInput);
  // 1️⃣ Redis cache (exact)
  const cacheKey = `cache:${sessionId}:${hash}`;
  const cachedChatMessage = await getCache(cacheKey)
    if(cachedChatMessage){
  console.log(`Cache hit 🚀!!!-----------------`);
  return cachedChatMessage;
}
  // 2️⃣ Vector DB (semantic)
  const vectorResult = await searchVector(message);
  const match = vectorResult?.metadatas?.[0]?.[0];
  // 0.1 best 0.9 worst
  const distance = vectorResult?.distances?.[0]?.[0];
  console.log(`distance: ${distance}`);
  
  if (match && typeof match.response === "string" &&
  distance !== null &&
  distance < 0.4) {
    console.log("Semantic cache hit 🚀");
    return match.response;
  }
  // 3️⃣ LLM fallback
  console.log(`Calling OpenAI`);
  const messages = buildChatPrompt(message,history)
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: getMaxTokens(message),
    temperature: 0.7,
    messages: messages
  })
    // 🔥 Token logging
  console.log("Token Usage:", {
    input: response.usage?.prompt_tokens,
    output: response.usage?.completion_tokens,
    total: response.usage?.total_tokens,
  });
  const reply = response.choices[0].message.content || ''
  // 4️⃣ Store in Redis + Vector DB
  await setCache(cacheKey, reply);
  await storeVector(message,reply)
  return reply;
}


// 👉 await openai.chat.completions.create(...)
// does NOT wait for full output
// 👉 It returns a stream object
// 👉 for await pulls chunks as they arrive
// 👉 res.write() sends them instantly
export async function streamChatResponse(message: string,history: any, res: Response) {

  const messages = buildChatPrompt(message,history);
  let outputLength = 0;


  //“Give me a stream object that I can iterate over”
  //It returns an AsyncIterable (stream)
  // await use: 1. Connection to OpenAI 2.Stream to be initialized 
  const stream = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    stream: true,
    temperature: 0.7,
    max_tokens: getMaxTokens(message),
  });


  // Now this loop: Waits for each chunk -> Processes it -> Continues
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;

    if (content) {
      res.write(`data: ${content}\n\n`);
       outputLength += content.length;
    }
  }
  res.write("data: [DONE]\n\n");
  console.log("Approx output length:", outputLength);
  res.end();
}
// /ask API max_tokens: 300–500