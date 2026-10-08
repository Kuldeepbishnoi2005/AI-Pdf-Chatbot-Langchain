export interface SourceReference {
  filename: string;
  page?: number;
  snippet: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: SourceReference[];
  isStreaming?: boolean;
}

export interface IndexedDocument {
  filename: string;
  total_chunks: number;
  created_at: string;
}

export type IngestionStatus = 'idle' | 'uploading' | 'parsing' | 'embedding' | 'completed' | 'error';

export interface IngestionState {
  status: IngestionStatus;
  progressMessage?: string;
  storedCount?: number;
  error?: string;
}
