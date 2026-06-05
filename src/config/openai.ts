import openAI  from "openai";
import { OPENAI_API_KEY } from "./env";
export const openai = new openAI.OpenAI({
  apiKey: OPENAI_API_KEY,
})