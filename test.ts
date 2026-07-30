import { ChromaClient } from "chromadb";

const client: any = new ChromaClient({
  host: "chroma-db-ghzz.onrender.com",
  port: 443,
  ssl: true,
});

async function main() {
  try {
    console.log("Chroma version:", await client.version());

    const collections = await client.listCollections();
    // console.log("Collections:", collections);

    // Try to find collection named 'snf'
    const targetName = "snf";
    let found = (collections || []).find((c: any) => c.name?.toLowerCase() === targetName.toLowerCase());
    if (!found) {
      console.log(`Collection '${targetName}' not found. Falling back to first collection.`);
      found = collections[0];
      if (!found) {
        console.log("No collections available.");
        return;
      }
    }

    console.log(`Using collection: ${found._name || found.name}`);

    // Obtain a collection handle (different SDK versions expose different APIs)
    let coll: any = null;
    if (typeof client.getCollection === "function") {
      coll = await client.getCollection({ name: found.name });
    } else if (typeof client.collection === "function") {
      coll = await client.collection(found.name);
    } else if (client._collections && client._collections[found.name]) {
      coll = client._collections[found.name];
    }

    if (!coll) {
      console.log("Could not obtain collection handle for", found.name);
      return;
    }

    // Try a few ways to fetch documents
    let docs: any = null;
    if (typeof coll.get === "function") {
      // include common fields
      try {
        docs = await coll.get({ include: ["ids", "metadatas", "documents", "embeddings"] });
      } catch (err) {
        // some SDKs accept no args
        try {
          docs = await coll.get();
        } catch (e) {
          // ignore
        }
      }
    }

    if (!docs && typeof coll.query === "function") {
      try {
        docs = await coll.query({ nResults: 10, include: ["ids", "metadatas", "documents"] });
      } catch (err) {
        // ignore
      }
    }

    // Normalize different SDK result shapes and print the first document
    // console.log("Fetched raw result:", docs);
    let firstDoc: any = null;
    let firstMeta: any = null;
    if (docs) {
      if (docs.documents && docs.documents.length) {
        firstDoc = docs.documents[0];
      } else if (Array.isArray(docs) && docs.length) {
        firstDoc = docs[0];
      } else if (docs.results && docs.results.length) {
        // some SDKs return results array
        const r = docs.results[0];
        firstDoc = r.document || r.documents || r;
        firstMeta = r.metadata || r.metadatas || null;
      }

      if (!firstDoc && docs.ids && docs.ids.length && docs.metadatas) {
        // try to reconstruct
        firstDoc = docs.metadatas[0] || null;
      }
    }

    // console.log("First document:", firstDoc);
    if (firstMeta) console.log("First metadata:", firstMeta);

    // Print unique metadatas (deduplicate by `source` if present)
    const metas = docs?.metadatas ?? (firstMeta ? [firstMeta] : []);
    if (metas && metas.length) {
      const seen = new Set<string>();
      const uniqueMetas: any[] = [];
      for (const m of metas) {
        if (!m) continue;
        let key: string;
        if (m && typeof m === "object" && "source" in m && (m as any).source) {
          key = String((m as any).source);
        } else {
          key = JSON.stringify(m);
        }
        if (!seen.has(key)) {
          seen.add(key);
          uniqueMetas.push(m);
        }
      }
      console.log("Unique metadatas:", uniqueMetas);
    } else {
      console.log("No metadatas present in result.");
    }
  } catch (err) {
    console.error(err);
  }
}

main();