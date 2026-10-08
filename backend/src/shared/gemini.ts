import { GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI } from '@langchain/google-genai';
import dotenv from 'dotenv';

dotenv.config();

export class GeminiEmbeddings1536 extends GoogleGenerativeAIEmbeddings {
  private formatDimension(vec: number[]): number[] {
    if (!vec) return new Array(1536).fill(0);
    if (vec.length === 1536) return vec;
    if (vec.length > 1536) return vec.slice(0, 1536);
    const padded = new Array(1536).fill(0);
    for (let i = 0; i < vec.length; i++) {
      padded[i] = vec[i];
    }
    return padded;
  }

  override async embedQuery(document: string): Promise<number[]> {
    const raw = await super.embedQuery(document);
    return this.formatDimension(raw);
  }

  override async embedDocuments(documents: string[]): Promise<number[][]> {
    const rawDocs = await super.embedDocuments(documents);
    return rawDocs.map((vec) => this.formatDimension(vec));
  }
}

export function getGeminiEmbeddings(): GeminiEmbeddings1536 {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('[Gemini Warning] GEMINI_API_KEY is not set in environment variables.');
  }
  const modelName = process.env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-2';

  return new GeminiEmbeddings1536({
    apiKey: apiKey,
    model: modelName,
  });
}

export function getChatModel(streaming = false): ChatGoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
  if (!apiKey) {
    console.warn('[Gemini Warning] GEMINI_API_KEY is not set in environment variables.');
  }
  return new ChatGoogleGenerativeAI({
    apiKey: apiKey,
    model: modelName,
    temperature: 0.2,
    streaming: streaming,
  });
}
