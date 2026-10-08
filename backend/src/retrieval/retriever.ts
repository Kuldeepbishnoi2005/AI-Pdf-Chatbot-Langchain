import { getGeminiEmbeddings } from '../shared/gemini.js';
import { getSupabaseClient } from '../shared/supabase.js';
import { SearchResultDoc } from '../shared/types.js';

export async function searchVectorStore(
  question: string,
  matchCount = 5,
  filterFilename?: string
): Promise<SearchResultDoc[]> {
  const embeddingsModel = getGeminiEmbeddings();
  const supabase = getSupabaseClient();

  console.log(`[Retriever] Generating query embedding with Gemini for: "${question}"`);
  const queryEmbedding = await embeddingsModel.embedQuery(question);

  const filter = filterFilename ? { filename: filterFilename } : {};

  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: queryEmbedding,
    match_count: matchCount,
    filter: filter,
  });

  if (error) {
    console.error('[Retriever Error] Supabase match_documents error:', error);
    // Fallback: search directly if RPC fails
    throw new Error(`Vector search failed in Supabase: ${error.message}`);
  }

  if (!data || data.length === 0) {
    console.log('[Retriever] No matching chunks found.');
    return [];
  }

  console.log(`[Retriever] Retrieved ${data.length} document chunks.`);
  return data.map((item: any) => ({
    id: item.id,
    content: item.content,
    metadata: item.metadata || {},
    similarity: item.similarity || 0,
  }));
}
