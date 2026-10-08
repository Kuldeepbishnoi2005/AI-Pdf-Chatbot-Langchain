-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create documents table for storing chunked PDF text and Gemini 1536d embeddings
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
  embedding VECTOR(1536),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create HNSW index for fast vector cosine similarity search
CREATE INDEX IF NOT EXISTS documents_embedding_hnsw_idx 
  ON documents USING hnsw (embedding vector_cosine_ops);

-- Create GIN index on metadata for fast JSON filtering (e.g. by filename or page)
CREATE INDEX IF NOT EXISTS documents_metadata_gin_idx 
  ON documents USING gin (metadata);

-- Match documents RPC function used by LangChain SupabaseVectorStore and retrieval graph
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding VECTOR(1536),
  match_count INT DEFAULT 5,
  filter JSONB DEFAULT '{}'::jsonb
) RETURNS TABLE (
  id UUID,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
#variable_conflict use_column
BEGIN
  RETURN QUERY
  SELECT
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) AS similarity
  FROM documents
  WHERE (filter = '{}'::jsonb OR documents.metadata @> filter)
  ORDER BY documents.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Helper RPC function to fetch summary of uploaded/indexed documents
CREATE OR REPLACE FUNCTION get_indexed_documents()
RETURNS TABLE (
  filename TEXT,
  total_chunks BIGINT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
AS $$
  SELECT 
    metadata->>'filename' AS filename,
    COUNT(*) AS total_chunks,
    MAX(created_at) AS created_at
  FROM documents
  WHERE metadata->>'filename' IS NOT NULL
  GROUP BY metadata->>'filename'
  ORDER BY MAX(created_at) DESC;
$$;

-- Helper function to delete documents by filename
CREATE OR REPLACE FUNCTION delete_document_by_filename(target_filename TEXT)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count INT;
BEGIN
  DELETE FROM documents
  WHERE metadata->>'filename' = target_filename;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;
