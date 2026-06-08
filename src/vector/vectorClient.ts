// vector/vectorClient.ts

import { ChromaClient } from "chromadb";
import { config } from "../config/env";
export const chromaClient = new ChromaClient({
  path: config.chromaUrl,
});

export async function getCollection(name: string) {
  return chromaClient.getOrCreateCollection({
    name,
  });
}