import express, { Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import { ingestionGraph } from './ingestion/graph.js';
import { retrievalGraph } from './retrieval/graph.js';
import { searchVectorStore } from './retrieval/retriever.js';
import { constructContextAndSources, generateAnswerWithContext } from './retrieval/generator.js';
import { getSupabaseClient } from './shared/supabase.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 2024;

// Enable CORS and JSON body parsing
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS
  ? process.env.CORS_ALLOWED_ORIGINS.split(',').map((s) => s.trim())
  : '*';

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Memory storage for multer file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max per PDF
});

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    server: 'ai-pdf-chatbot-backend',
    port: PORT,
    assistants: ['ingestion_graph', 'retrieval_graph'],
  });
});

app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'AI PDF Chatbot Backend Running',
    langgraph_server: `http://localhost:${PORT}`,
    endpoints: ['/api/ingest', '/api/chat', '/api/documents', '/runs/stream'],
  });
});

// Ingestion API Route
app.post('/api/ingest', upload.array('files'), async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({ error: 'No PDF files uploaded.' });
      return;
    }

    console.log(`[API /ingest] Received ${files.length} PDF file(s)`);

    const filePayloads = files.map((f) => ({
      filename: f.originalname,
      bufferBase64: f.buffer.toString('base64'),
    }));

    // Invoke LangGraph Ingestion Graph
    const result = await ingestionGraph.invoke({
      files: filePayloads,
    });

    res.json({
      success: true,
      storedCount: result.storedCount,
      status: result.status,
      filesProcessed: files.map((f) => f.originalname),
    });
  } catch (error) {
    console.error('[API /ingest Error]:', error);
    res.status(500).json({
      error: (error as Error).message || 'Failed to process PDF ingestion.',
    });
  }
});

// Retrieval Chat API Route (supports non-streaming and streaming SSE)
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { question, chatHistory = [], stream = false } = req.body;

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      res.status(400).json({ error: 'Question is required.' });
      return;
    }

    if (stream) {
      // Set SSE headers for streaming responses
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // 1. Retrieve vector matches
      const retrievedDocs = await searchVectorStore(question, 5);
      const { contextText, sources } = constructContextAndSources(retrievedDocs);

      // Send sources metadata event first
      res.write(`data: ${JSON.stringify({ type: 'sources', sources })}\n\n`);

      // 2. Stream tokens from LLM
      await generateAnswerWithContext(
        question,
        contextText,
        chatHistory,
        (token: string) => {
          res.write(`data: ${JSON.stringify({ type: 'token', token })}\n\n`);
        }
      );

      res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
      res.end();
    } else {
      // Non-streaming graph execution
      const result = await retrievalGraph.invoke({
        question,
        chatHistory,
      });

      res.json({
        answer: result.answer,
        sources: result.sources,
        status: result.status,
      });
    }
  } catch (error) {
    console.error('[API /chat Error]:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: (error as Error).message || 'Failed to process question answering.',
      });
    } else {
      res.write(`data: ${JSON.stringify({ type: 'error', error: (error as Error).message })}\n\n`);
      res.end();
    }
  }
});

// LangGraph REST spec compatible runs/stream endpoint
app.post('/runs/stream', async (req: Request, res: Response) => {
  try {
    const { assistant_id, input } = req.body;

    if (assistant_id === 'ingestion_graph') {
      const result = await ingestionGraph.invoke(input || {});
      res.json(result);
    } else if (assistant_id === 'retrieval_graph') {
      const result = await retrievalGraph.invoke(input || {});
      res.json(result);
    } else {
      res.status(404).json({ error: `Assistant ID '${assistant_id}' not found.` });
    }
  } catch (error) {
    console.error('[runs/stream Error]:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Fetch summary of indexed PDF documents
app.get('/api/documents', async (_req: Request, res: Response) => {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.rpc('get_indexed_documents');

    if (error) {
      // Fallback query if RPC fails
      const { data: rows, error: selectErr } = await supabase
        .from('documents')
        .select('metadata, created_at');

      if (selectErr) {
        throw selectErr;
      }

      const summaryMap = new Map<string, { filename: string; total_chunks: number; created_at: string }>();
      (rows || []).forEach((row: any) => {
        const fn = row.metadata?.filename;
        if (fn) {
          const current = summaryMap.get(fn) || { filename: fn, total_chunks: 0, created_at: row.created_at };
          current.total_chunks += 1;
          summaryMap.set(fn, current);
        }
      });

      res.json({ documents: Array.from(summaryMap.values()) });
      return;
    }

    res.json({ documents: data || [] });
  } catch (error) {
    console.error('[API /documents Error]:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Delete indexed PDF document by filename
app.delete('/api/documents/:filename', async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('metadata->>filename', filename);

    if (error) {
      throw error;
    }

    res.json({ success: true, message: `Deleted document ${filename}` });
  } catch (error) {
    console.error('[API Delete Error]:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🚀 AI PDF Chatbot Backend listening on port ${PORT}`);
  console.log(`📍 LangGraph API URL: http://localhost:${PORT}`);
  console.log(`===================================================`);
});
