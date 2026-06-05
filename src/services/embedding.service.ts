import { openai } from "../config/openai";

export async function generateEmbedding(text:string) {

  const response = await openai.embeddings.create({
    input: text,
    model: "text-embedding-3-small",
  })
  return ( response).data[0].embedding;
}