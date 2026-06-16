// vector/vectorClient.ts

import { ChromaClient } from "chromadb";
import { config } from "../config/env";
export const chromaClient = new ChromaClient({
  host: config.chromaHost,
  port: parseInt(config.chromaPort),
  ssl: config.chromaSsl,
});

export async function getCollection(name: string) {
  return chromaClient.getOrCreateCollection({
    name,
  });
}