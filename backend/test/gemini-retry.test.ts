import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isTransientError,
  calculateBackoffDelay,
  executeWithRetryAndFallback,
  USER_FRIENDLY_BUSY_MESSAGE,
} from '../src/shared/gemini-retry.js';

test('isTransientError identifies 503, 429, 500, and network errors correctly', () => {
  assert.equal(isTransientError({ status: 503, message: 'Service Unavailable' }), true);
  assert.equal(isTransientError({ status: 429, message: 'Too Many Requests' }), true);
  assert.equal(isTransientError({ status: 500, message: 'Internal Server Error' }), true);
  assert.equal(isTransientError(new Error('503 Service Unavailable - This model is currently experiencing high demand.')), true);
  assert.equal(isTransientError(new Error('fetch failed: ECONNRESET')), true);

  // Non-transient 4xx errors
  assert.equal(isTransientError({ status: 401, message: 'Invalid API Key' }), false);
  assert.equal(isTransientError({ status: 400, message: 'Bad Request' }), false);
  assert.equal(isTransientError(new Error('API_KEY_INVALID')), false);
  assert.equal(isTransientError(new Error('PERMISSION_DENIED')), false);
});

test('calculateBackoffDelay produces bounded exponential backoff with jitter', () => {
  const delay0 = calculateBackoffDelay(0, 100, 1000);
  const delay1 = calculateBackoffDelay(1, 100, 1000);
  
  assert.ok(delay0 >= 100 && delay0 <= 350, `delay0 (${delay0}) out of range`);
  assert.ok(delay1 >= 200 && delay1 <= 450, `delay1 (${delay1}) out of range`);
});

test('executeWithRetryAndFallback returns result immediately on first attempt success', async () => {
  let callCount = 0;
  const result = await executeWithRetryAndFallback(
    async (model) => {
      callCount++;
      return `Answer from ${model}`;
    },
    { primaryModel: 'gemini-3.8-flash', maxRetriesPerModel: 2, baseDelayMs: 10 }
  );

  assert.equal(result, 'Answer from gemini-3.8-flash');
  assert.equal(callCount, 1);
});

test('executeWithRetryAndFallback retries transient 503 and succeeds on primary model', async () => {
  let attempts = 0;
  const result = await executeWithRetryAndFallback(
    async (model) => {
      attempts++;
      if (attempts === 1) {
        const err: any = new Error('503 Service Unavailable - This model is currently experiencing high demand.');
        err.status = 503;
        throw err;
      }
      return `Answer from ${model} after retry`;
    },
    { primaryModel: 'gemini-3.8-flash', maxRetriesPerModel: 2, baseDelayMs: 10 }
  );

  assert.equal(result, 'Answer from gemini-3.8-flash after retry');
  assert.equal(attempts, 2);
});

test('executeWithRetryAndFallback falls back to secondary model when primary is exhausted', async () => {
  const attempts: string[] = [];
  const result = await executeWithRetryAndFallback(
    async (model) => {
      attempts.push(model);
      if (model === 'gemini-3.8-flash') {
        const err: any = new Error('503 Service Unavailable');
        err.status = 503;
        throw err;
      }
      return `Answer from ${model}`;
    },
    {
      primaryModel: 'gemini-3.8-flash',
      fallbackModel: 'gemini-3.7-flash',
      maxRetriesPerModel: 1, // 2 attempts per model
      baseDelayMs: 10,
    }
  );

  assert.equal(result, 'Answer from gemini-3.7-flash');
  // gemini-3.8-flash tried twice, then fallback gemini-3.7-flash tried once and succeeded
  assert.deepEqual(attempts, [
    'gemini-3.8-flash',
    'gemini-3.8-flash',
    'gemini-3.7-flash',
  ]);
});

test('executeWithRetryAndFallback throws user-friendly message when all attempts exhausted', async () => {
  await assert.rejects(
    async () => {
      await executeWithRetryAndFallback(
        async (_model) => {
          const err: any = new Error('503 Service Unavailable');
          err.status = 503;
          throw err;
        },
        {
          primaryModel: 'gemini-3.8-flash',
          fallbackModel: 'gemini-3.7-flash',
          maxRetriesPerModel: 1,
          baseDelayMs: 10,
        }
      );
    },
    (err: any) => {
      return err.message === USER_FRIENDLY_BUSY_MESSAGE;
    }
  );
});

test('executeWithRetryAndFallback throws immediately on non-transient 401 error', async () => {
  let callCount = 0;
  await assert.rejects(
    async () => {
      await executeWithRetryAndFallback(
        async (_model) => {
          callCount++;
          const err: any = new Error('API_KEY_INVALID');
          err.status = 401;
          throw err;
        },
        { primaryModel: 'gemini-3.8-flash', maxRetriesPerModel: 2, baseDelayMs: 10 }
      );
    },
    (err: any) => {
      return err.message === 'API_KEY_INVALID';
    }
  );

  assert.equal(callCount, 1);
});
