import { DocumentChunk } from './textSplitter.js';
import { getGeminiEmbeddings } from '../shared/gemini.js';
import { getSupabaseClient } from '../shared/supabase.js';

export async function storeChunksInSupabase(
  chunks: DocumentChunk[]
): Promise<number> {
  if (chunks.length === 0) return 0;

  const embeddingsModel = getGeminiEmbeddings();
  const supabase = getSupabaseClient();

  const texts = chunks.map((c) => c.pageContent);
  
  console.log(`[VectorStore] Generating Gemini embeddings (1536d) for ${texts.length} chunks...`);
  const embeddings = await embeddingsModel.embedDocuments(texts);

  const rowsToInsert = chunks.map((chunk, index) => ({
    content: chunk.pageContent,
    metadata: chunk.metadata,
    embedding: embeddings[index],
  }));

  // Batch insert into Supabase in chunks of 100
  const BATCH_SIZE = 100;
  let insertedTotal = 0;

  for (let i = 0; i < rowsToInsert.length; i += BATCH_SIZE) {
    const batch = rowsToInsert.slice(i, i + BATCH_SIZE);
    const { data, error } = await supabase
      .from('documents')
      .insert(batch)
      .select('id');

    if (error) {
      console.error('[VectorStore Error] Failed to insert batch into Supabase:', error);
      throw new Error(`Database error while storing embeddings: ${error.message}`);
    }

    insertedTotal += data?.length || batch.length;
  }

  console.log(`[VectorStore] Successfully stored ${insertedTotal} chunks in Supabase.`);
  return insertedTotal;
}

export async function deleteChunksByFilename(filename: string): Promise<number> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc('delete_document_by_filename', {
    target_filename: filename,
  });

  if (error) {
    // Fallback to direct DELETE if RPC not installed
    const { error: deleteErr } = await supabase
      .from('documents')
      .delete()
      .eq('metadata->>filename', filename);

    if (deleteErr) {
      console.error(`[VectorStore Error] Failed to delete chunks for ${filename}:`, deleteErr);
      return 0;
    }
  }

  return data || 0;
}
