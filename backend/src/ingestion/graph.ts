import { StateGraph, Annotation, START, END } from '@langchain/langgraph';
import { parsePdfFile, PageDocument } from './pdfParser.js';
import { splitDocuments, DocumentChunk } from './textSplitter.js';
import { storeChunksInSupabase, deleteChunksByFilename } from './vectorStore.js';
import { UploadedFilePayload } from '../shared/types.js';

export const IngestionAnnotation = Annotation.Root({
  files: Annotation<UploadedFilePayload[]>({
    reducer: (x, y) => y ?? x,
    default: () => [],
  }),
  parsedDocuments: Annotation<PageDocument[]>({
    reducer: (x, y) => y ?? x,
    default: () => [],
  }),
  chunks: Annotation<DocumentChunk[]>({
    reducer: (x, y) => y ?? x,
    default: () => [],
  }),
  storedCount: Annotation<number>({
    reducer: (x, y) => y ?? x,
    default: () => 0,
  }),
  status: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => 'idle',
  }),
  error: Annotation<string | undefined>({
    reducer: (x, y) => y ?? x,
    default: () => undefined,
  }),
});

async function receiveUploadedPdfNode(state: typeof IngestionAnnotation.State) {
  if (!state.files || state.files.length === 0) {
    throw new Error('No PDF files received for ingestion.');
  }
  return {
    status: 'parsing',
  };
}

async function parsePdfNode(state: typeof IngestionAnnotation.State) {
  const allParsedDocs: PageDocument[] = [];

  for (const filePayload of state.files) {
    console.log(`[Ingestion Graph] Parsing file: ${filePayload.filename}`);
    const buffer = Buffer.from(filePayload.bufferBase64, 'base64');
    
    // Remove existing chunks for this filename to avoid duplicate entries
    await deleteChunksByFilename(filePayload.filename);

    const pages = await parsePdfFile(filePayload.filename, buffer);
    allParsedDocs.push(...pages);
  }

  return {
    parsedDocuments: allParsedDocs,
    status: 'chunking',
  };
}

async function splitTextNode(state: typeof IngestionAnnotation.State) {
  console.log(`[Ingestion Graph] Splitting ${state.parsedDocuments.length} page documents into chunks...`);
  const chunks = await splitDocuments(state.parsedDocuments);

  return {
    chunks,
    status: 'embedding',
  };
}

async function generateEmbeddingsAndStoreNode(state: typeof IngestionAnnotation.State) {
  console.log(`[Ingestion Graph] Storing ${state.chunks.length} chunks in Supabase...`);
  const count = await storeChunksInSupabase(state.chunks);

  return {
    storedCount: count,
    status: 'completed',
  };
}

const builder = new StateGraph(IngestionAnnotation)
  .addNode('receiveUploadedPdf', receiveUploadedPdfNode)
  .addNode('parsePdf', parsePdfNode)
  .addNode('splitTextIntoChunks', splitTextNode)
  .addNode('generateEmbeddingsAndStore', generateEmbeddingsAndStoreNode)
  .addEdge(START, 'receiveUploadedPdf')
  .addEdge('receiveUploadedPdf', 'parsePdf')
  .addEdge('parsePdf', 'splitTextIntoChunks')
  .addEdge('splitTextIntoChunks', 'generateEmbeddingsAndStore')
  .addEdge('generateEmbeddingsAndStore', END);

export const ingestionGraph = builder.compile();
