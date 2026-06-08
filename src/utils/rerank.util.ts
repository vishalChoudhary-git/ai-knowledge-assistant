
export function scoreChunk(query:string, chunk: string): number {
const queryWords = query.toLowerCase().split(/\s+/);

let score = 0;

for(const word of queryWords)
  if(chunk.includes(word)){
    score++
  }
 
  
  return score;
}

export function rerankChunks(query: string, chunks: string[] ){

  const reRankScore = chunks.map(chunk => ({
    chunk, score: scoreChunk(query,chunk)
  })
).sort((a, b) => b.score - a.score) // higher score first
 .map(item => item.chunk)
  
 return reRankScore;
}