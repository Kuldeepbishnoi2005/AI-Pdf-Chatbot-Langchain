import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

export interface RetryOptions {
  maxRetriesPerModel?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  primaryModel?: string;
  fallbackModel?: string;
}

export function isTransientError(error: any): boolean {
  if (!error) return false;
  
  const status = error.status || error.statusCode || error?.response?.status || error?.error?.code;
  const message = String(error.message || error || '').toLowerCase();

  // Explicit non-retryable 4xx statuses (except 429 rate limit)
  if (typeof status === 'number' && status >= 400 && status < 500 && status !== 429) {
    return false;
  }

  // Check for non-retryable message patterns (e.g. invalid API key, permission denied, bad request)
  if (
    message.includes('api_key_invalid') ||
    message.includes('invalid api key') ||
    message.includes('permission_denied') ||
    message.includes('permission denied') ||
    message.includes('invalid argument') ||
    message.includes('400 bad request') ||
    message.includes('401 unauthorized') ||
    message.includes('403 forbidden') ||
    message.includes('404 not found')
  ) {
    return false;
  }

  // Explicit transient statuses
  if ([429, 500, 502, 503, 504].includes(status)) {
    return true;
  }

  // Transient error message patterns
  if (
    message.includes('503') ||
    message.includes('service unavailable') ||
    message.includes('high demand') ||
    message.includes('429') ||
    message.includes('too many requests') ||
    message.includes('rate limit') ||
    message.includes('500') ||
    message.includes('internal error') ||
    message.includes('502') ||
    message.includes('bad gateway') ||
    message.includes('504') ||
    message.includes('gateway timeout') ||
    message.includes('econnreset') ||
    message.includes('etimedout') ||
    message.includes('fetch failed') ||
    message.includes('temporarily unavailable') ||
    message.includes('overloaded')
  ) {
    return true;
  }

  return false;
}

export function calculateBackoffDelay(
  attempt: number,
  baseDelayMs = 500,
  maxDelayMs = 4000
): number {
  const exponential = Math.min(maxDelayMs, baseDelayMs * Math.pow(2, attempt));
  const jitter = Math.floor(Math.random() * 200); // 0-200ms random jitter
  return exponential + jitter;
}

export const USER_FRIENDLY_BUSY_MESSAGE =
  'The AI service is temporarily busy. Please try again shortly.';

export async function executeWithRetryAndFallback<T>(
  operation: (modelName: string) => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const maxRetries = options.maxRetriesPerModel ?? 2; // 2 retries = 3 attempts total
  const baseDelay = options.baseDelayMs ?? 500;
  const maxDelay = options.maxDelayMs ?? 4000;

  const primaryModel =
    options.primaryModel || process.env.GEMINI_MODEL || 'gemini-3.8-flash';
  const fallbackModel =
    options.fallbackModel || process.env.GEMINI_FALLBACK_MODEL || 'gemini-3.7-flash';

  const modelsToTry = [primaryModel];
  if (fallbackModel && fallbackModel !== primaryModel) {
    modelsToTry.push(fallbackModel);
  }

  let lastError: any = null;

  for (let mIdx = 0; mIdx < modelsToTry.length; mIdx++) {
    const currentModel = modelsToTry[mIdx];
    const isFallback = mIdx > 0;

    if (isFallback) {
      console.warn(
        `[Gemini Retry] Primary model "${primaryModel}" unavailable. Attempting fallback model "${currentModel}"...`
      );
    }

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation(currentModel);
        if (isFallback || attempt > 0) {
          console.log(
            `[Gemini Retry] Successfully executed operation using model "${currentModel}" (attempt ${attempt + 1}).`
          );
        }
        return result;
      } catch (err: any) {
        lastError = err;
        const transient = isTransientError(err);
        const statusCode = err.status || err.statusCode || err?.response?.status || 'transient/network';
        const errDesc = err.message ? err.message.slice(0, 120) : String(err);

        if (!transient) {
          console.error(
            `[Gemini Error] Non-retryable error encountered on model "${currentModel}" [Status: ${statusCode}]: ${errDesc}`
          );
          throw err;
        }

        if (attempt < maxRetries) {
          const delay = calculateBackoffDelay(attempt, baseDelay, maxDelay);
          console.warn(
            `[Gemini Retry] Model "${currentModel}" attempt ${attempt + 1} failed [Status: ${statusCode}]. Retrying in ${delay}ms...`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          console.warn(
            `[Gemini Retry] Model "${currentModel}" exhausted all ${maxRetries + 1} attempts.`
          );
        }
      }
    }
  }

  console.error('[Gemini Error] All model attempts and retries failed.');
  throw new Error(USER_FRIENDLY_BUSY_MESSAGE);
}
