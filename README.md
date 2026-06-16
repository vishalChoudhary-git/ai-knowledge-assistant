# AI Knowledge Assistant

A production-style AI assistant built using OpenAI, RAG, Redis, ChromaDB and React.

## Features

- Streaming Responses (SSE)
- Conversation Memory
- Redis Cache
- Vector Search (ChromaDB)
- Retrieval Augmented Generation (RAG)
- Context Compression
- Source Attribution
- React Chat UI

## Tech Stack

Backend:
- Node.js
- TypeScript
- OpenAI
- Redis
- ChromaDB

Frontend:
- React
- Vite

## Run Locally

### Backend

npm install
npm run dev

### Frontend

npm install
npm run dev

### Future enhancements:

| Priority | Item                                                             | Reason                   |
| -------- | ---------------------------------------------------------------- | ------------------------ |
| High     | Replace Chroma with managed Vector DB (Qdrant/Pinecone/pgvector) | Persistent cloud storage |
| High     | Health & Readiness endpoints                                     | Production monitoring    |
| High     | Pino logging                                                     | Structured logs          |
| High     | Authentication                                                   | Multi-user support       |
| Medium   | React architecture refactor                                      | Better maintainability   |
| Medium   | Request ID middleware                                            | Tracing                  |
| Medium   | Metrics & Monitoring                                             | Observability            |
| Medium   | Docker Compose                                                   | Easier local setup       |
| Low      | Kubernetes                                                       | Production scale         |
| Low      | CI/CD                                                            | Automated deployments    |
 