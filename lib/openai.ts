import OpenAI from "openai";
import { AppError } from "@/lib/errors";
import { env } from "@/lib/env";

let openaiClient: OpenAI | null = null;

export function hasOpenAIConfig() {
  return Boolean(env.OPENAI_API_KEY);
}

export function getOpenAIModel() {
  return env.OPENAI_MODEL ?? "gpt-5-mini";
}

export function getOpenAIClient() {
  if (!env.OPENAI_API_KEY) {
    throw new AppError(503, "OpenAI is not configured.", "OPENAI_NOT_CONFIGURED");
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: env.OPENAI_API_KEY
    });
  }

  return openaiClient;
}
