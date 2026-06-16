import { ChromaClient } from "chromadb";

const client = new ChromaClient({
  host: "chroma-db-ghzz.onrender.com",
  port: 443,
  ssl: true,
});

async function main() {
  try {
    console.log(await client.version());
    console.log(await client.listCollections());
  } catch (err) {
    console.error(err);
  }
}

main();