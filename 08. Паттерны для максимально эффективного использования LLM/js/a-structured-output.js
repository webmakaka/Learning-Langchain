import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";

const joke = z.object({
  setup: z.string().describe("Начало шутки"),
  punchline: z.string().describe("Развязка шутки"),
});

const llm = new ChatOpenAI({
  model: 'auto',
  temperature: 0,
  configuration: {
    baseURL: 'https://vireonix.ai/v1',
  },
  apiKey: 'not-needed',
});

const structuredLlm = llm.withStructuredOutput(joke);

const result = await structuredLlm.invoke("Расскажи мне шутку про кошек");
console.log(result);
