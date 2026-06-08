import openAI  from "openai";
import { config } from "./env";

export const openai = new openAI.OpenAI({
  apiKey: config.openAiKey,
})