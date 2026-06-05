
export function buildEnhancedQuery(message: string, history:{
  role: string, content: string
}[]){
const recentHistory = history.filter(m => m.role === "user").slice(-3)
  .map(m => m.content)
  .join(" ");

return `${recentHistory} ${message}`;
} 