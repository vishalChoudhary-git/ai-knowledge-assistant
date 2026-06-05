export function keywordScore(query: string, text: string){

  const queryWords = query.toLowerCase().split(/\s+/);
  let score = 0;

  for(const word of queryWords){
    if(text.toLocaleLowerCase().includes(word)){
      score += 2; // weight keyword higher
    }
  }

  return score;
}