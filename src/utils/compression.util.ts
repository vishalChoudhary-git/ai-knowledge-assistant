

export function compressChunk(query: string, chunk: string): string {
const sentences = chunk.split(/[.\n]/);
const queryWords = query.toLowerCase().split(/\s+/);

  const relevantSentences = sentences.filter(sentence => {
    return queryWords.some(word =>
      sentence.toLowerCase().includes(word)
    );
  });
  const result = relevantSentences.join(". ").trim();
  console.log("compressChunk:",result);
  
  return result;
}