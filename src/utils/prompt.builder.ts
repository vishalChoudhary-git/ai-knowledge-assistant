type Role = 'system' | 'user'| "assistant";

interface Message {
  role: Role,
  content: string
}

export function buildChatPrompt(userMessage: string,history: Message[] = []): Message[] {
  return [
    {
      role: "system",
      content: [
  "You are a helpful AI assistant.",
  "Give concise and complete answers.",
  "Keep answers concise and under 150 words.",
  "Do not leave sentences incomplete.",
  "Summarize if needed to fit within the limit.",
  "Avoid unnecessary details."
].join(" "),
    },
    ...history,
    {
      role: 'user',
      content: userMessage
    }
  ];
}
export function buildRagPrompt(query: string, contextChunks: string[]): Message[] {
  return [
    {
      role: "system",
      content: [
  "You are a helpful AI assistant.",
  "Give concise and complete answers.",
  "Do not leave sentences incomplete.",
  "Summarize if needed to fit within the limit.",
  `If answer is not found, say "I don't know"`,
  "Keep answers concise and under 150 words.",
  "Answer ONLY from provided context.Do not repeat unnecessary details.",
  "You are a precise AI assistant."
].join(" ")
    },
    {
      role: "user",
      content: `
Context:
${contextChunks.join("\n\n")}

Question:
${query}
      `.trim(),
    },
  ];
}