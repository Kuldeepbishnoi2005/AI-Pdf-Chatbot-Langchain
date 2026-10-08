import { SourceReference, IndexedDocument } from './types';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_LANGGRAPH_API_URL ||
  'http://localhost:2024';

export class ApiClient {
  static async checkBackendHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${BASE_URL}/health`, { method: 'GET', cache: 'no-store' });
      if (!res.ok) return false;
      const data = await res.json();
      return data.status === 'ok';
    } catch {
      return false;
    }
  }

  static async uploadPdfs(
    files: File[],
    onProgress?: (message: string) => void
  ): Promise<{ storedCount: number; filesProcessed: string[] }> {
    onProgress?.('Preparing files for ingestion graph...');
    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file);
    }

    onProgress?.('Uploading to LangGraph server...');
    const response = await fetch(`${BASE_URL}/api/ingest`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(errorData.error || 'Failed to ingest PDF files.');
    }

    const data = await response.json();
    return {
      storedCount: data.storedCount || 0,
      filesProcessed: data.filesProcessed || files.map((f) => f.name),
    };
  }

  static async fetchIndexedDocuments(): Promise<IndexedDocument[]> {
    try {
      const res = await fetch(`${BASE_URL}/api/documents`, { cache: 'no-store' });
      if (!res.ok) return [];
      const data = await res.json();
      return data.documents || [];
    } catch {
      return [];
    }
  }

  static async deleteDocument(filename: string): Promise<boolean> {
    try {
      const res = await fetch(`${BASE_URL}/api/documents/${encodeURIComponent(filename)}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  static async streamChat(
    question: string,
    chatHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
    callbacks: {
      onSources?: (sources: SourceReference[]) => void;
      onToken?: (token: string) => void;
      onError?: (error: string) => void;
      onComplete?: () => void;
    }
  ): Promise<void> {
    try {
      const response = await fetch(`${BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          chatHistory,
          stream: true,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(errJson.error || 'Failed to generate response.');
      }

      if (!response.body) {
        throw new Error('Response body is not readable.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.slice(6);
            try {
              const event = JSON.parse(dataStr);
              if (event.type === 'sources' && event.sources) {
                callbacks.onSources?.(event.sources);
              } else if (event.type === 'token' && event.token) {
                callbacks.onToken?.(event.token);
              } else if (event.type === 'error') {
                callbacks.onError?.(event.error);
              } else if (event.type === 'done') {
                callbacks.onComplete?.();
              }
            } catch (e) {
              console.warn('[SSE Parse Error]', e, dataStr);
            }
          }
        }
      }

      callbacks.onComplete?.();
    } catch (err) {
      console.error('[API streamChat Error]', err);
      callbacks.onError?.((err as Error).message);
    }
  }
}
