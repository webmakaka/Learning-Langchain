import {
  AIMessage,
  HumanMessage,
  SystemMessage,
  trimMessages,
} from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";

const llm = new ChatOpenAI({
  model: 'auto',
  temperature: 0,
  configuration: {
    baseURL: 'https://vireonix.ai/v1',
  },
  apiKey: 'not-needed',
});

const messages = [
  new SystemMessage("ты хороший помощник"),
  new HumanMessage("Привет, я Malrey!"),
  new AIMessage("Привет!"),
  new HumanMessage("Мне нравится пиво kozel"),
  new AIMessage("Отлично"),
  new HumanMessage("Cкoлькo будет 2 + 2"),
  new AIMessage("4"),
  new HumanMessage("cnacибo"),
  new AIMessage("бeз проблем!"),
  new HumanMessage("вeceлишьcя?'"),
  new AIMessage("дa!"),
];

const trimmer = trimMessages({
  maxTokens: 65,
  strategy: "last",
  tokenCounter: llm,
  includeSystem: true,
  allowPartial: false,
  startOn: "human",
});

const trimmed = await trimmer.invoke(messages);
console.log(trimmed);
