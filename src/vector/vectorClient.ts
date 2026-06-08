// vector/vectorClient.ts

import { ChromaClient } from "chromadb";

export const chromaClient = new ChromaClient({
  path: process.env.CHROMA_URL!,
});

export async function getCollection(name: string) {
  return chromaClient.getOrCreateCollection({
    name,
  });
}