import { ChromaClient } from "chromadb";
import { generateEmbedding } from "./embedding.service";
import { chunkText } from "../utils/chunk.util";
import { rerankChunks } from '../utils/rerank.util'
import { keywordScore } from "../utils/keyword.util";
import { compressChunk } from "../utils/compression.util";
import { getCollection } from "../vector/vectorClient";
import { config } from "../config/env";
import { logger } from "../utils/logger";
const client = new ChromaClient({
  host: config.chromaHost,
  port: parseInt(config.chromaPort),
  ssl: config.chromaSsl,
});
const COLLECTION_NAME = 'semantic-cache';
const DOC_COLLECTION = "documents";

export async function getDocCollection() {
  return await client.getOrCreateCollection({
    name: DOC_COLLECTION,
    embeddingFunction: null,
  });
}

export async function storeVector(message: string, response: string) {
  const collection = await getCollection(COLLECTION_NAME);

  const embedding = await generateEmbedding(message);

  await collection.add({
    ids: [Date.now().toString()],
    embeddings: [embedding],
    documents: [message],
    metadatas: [{ response }],
  });
}

export async function searchVector(message:string) {

  const collection = await getCollection(COLLECTION_NAME);
  const embedding = await generateEmbedding(message);

  const result = collection.query({
    queryEmbeddings: [embedding],
    nResults:1
  })
  return result;
}

export async function storeDocument(text: string, source: string) {
  const col = await getDocCollection();

  const chunks = chunkText(text);

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const normalizedChunk = normalize(chunk);
    const embedding = await generateEmbedding(normalizedChunk);

    await col.add({
      ids: [`${source}-${Date.now()}-${i}`],
      embeddings: [embedding],
      documents: [chunk],
      metadatas: [{ source }],
    });
  }

  logger.info("Document stored in vector DB ✅");
}

function findStringValue(value: any): string | undefined {
  if (typeof value === "string") {
    if (value === "[object Object]" || value.trim() === "") return undefined;
    return value;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findStringValue(item);
      if (found) return found;
    }
    return undefined;
  }
  if (value && typeof value === "object") {
    if (typeof value.source === "string") return findStringValue(value.source);
    for (const item of Object.values(value)) {
      const found = findStringValue(item);
      if (found) return found;
    }
  }
  return undefined;
}

export async function listSources() {
  const col = await getDocCollection();

  const res: any = await (col as any).get?.({ include: ["metadatas"], limit: 1000 }) || {};
  const metadatas: any[] = res.metadatas || [];
  const sources = new Set<string>();

  for (const md of metadatas) {
    const found = findStringValue(md);
    if (found) sources.add(found);
  }

  return Array.from(sources);
}
function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "") // remove punctuation
    .trim();
}
export async function retrieveContext(query: string,source: string) {
  const col = await getDocCollection();
  const normalizedQuery = normalize(query);
  const embedding = await generateEmbedding(normalizedQuery);

  const result = await col.query({
    queryEmbeddings: [embedding],
    nResults: 5,
    where: source ? { source } : undefined,
  });
  const document = result.documents?.[0] || [];
  const distance: any = result.distances?.[0] || [];
const MAX_CHARS = 500;
let total = 0;
const limited: string[] = [];
  const hybridResults = document.map((doc:any, i)=>{
      const vectorScore = 1 - distance[i]; // convert distance → similarity
      const keyword = keywordScore(query, doc);
      const finalScore = vectorScore * 0.7 + keyword * 0.3;
      
      return {
        doc,
        score: finalScore,
    };
  })
  
  // 🔥 sort by combined score
  hybridResults.sort((a, b) => b.score - a.score);
  let topChunks = hybridResults.slice(0, 3).map(r => r.doc);
  if (isBroadQuery(query)) {
  // ❌ skip compression
  return topChunks;
}
  const compressed = topChunks.map(chunk =>
  compressChunk(query, chunk)
);

// remove empty
const finalChunks = compressed.filter(Boolean);

for (const chunk of finalChunks) {
  if (total + chunk.length > MAX_CHARS) break;
  limited.push(chunk);
  total += chunk.length;
}

return limited;

}
function isBroadQuery(query: string): boolean {
  const broadKeywords = ["what", "explain", "describe", "guidelines", "overview"];

  return broadKeywords.some(word =>
    query.toLowerCase().includes(word)
  );
}