export interface DocumentChunk {
  id?: string;
  content: string;
  metadata: {
    filename: string;
    page: number;
    totalPages: number;
    chunkIndex: number;
    [key: string]: any;
  };
  embedding?: number[];
}

export interface UploadedFilePayload {
  filename: string;
  bufferBase64: string;
}

export interface IngestionState {
  files: UploadedFilePayload[];
  parsedDocuments: Array<{
    pageContent: string;
    metadata: {
      filename: string;
      page: number;
      totalPages: number;
    };
  }>;
  chunks: Array<{
    pageContent: string;
    metadata: {
      filename: string;
      page: number;
      totalPages: number;
      chunkIndex: number;
    };
  }>;
  storedCount: number;
  status: 'idle' | 'parsing' | 'chunking' | 'embedding' | 'completed' | 'error';
  error?: string;
}

export interface SearchResultDoc {
  id: string;
  content: string;
  metadata: {
    filename: string;
    page?: number;
    chunkIndex?: number;
    [key: string]: any;
  };
  similarity: number;
}

export interface SourceReference {
  filename: string;
  page?: number;
  snippet: string;
}

export interface RetrievalState {
  question: string;
  chatHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  queryEmbedding?: number[];
  retrievedDocs: SearchResultDoc[];
  contextText?: string;
  answer?: string;
  sources: SourceReference[];
  status: 'idle' | 'retrieving' | 'generating' | 'completed' | 'error';
  error?: string;
}
