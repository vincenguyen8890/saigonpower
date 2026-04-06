import { createOpenAI } from '@ai-sdk/openai'

export const AI_MODEL = 'gpt-4o-mini'

export function getOpenAIModel() {
  const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY! })
  return openai(AI_MODEL)
}

export function hasOpenAI() {
  return !!process.env.OPENAI_API_KEY
}
