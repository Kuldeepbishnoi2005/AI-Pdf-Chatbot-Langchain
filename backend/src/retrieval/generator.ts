import { SystemMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { getChatModel } from '../shared/gemini.js';
import { executeWithRetryAndFallback } from '../shared/gemini-retry.js';
import { SearchResultDoc, SourceReference } from '../shared/types.js';

export function constructContextAndSources(retrievedDocs: SearchResultDoc[]) {
  if (!retrievedDocs || retrievedDocs.length === 0) {
    return {
      contextText: 'No relevant document context found in uploaded PDFs.',
      sources: [] as SourceReference[],
    };
  }

  const sourcesMap = new Map<string, SourceReference>();
  const contextBlocks: string[] = [];

  retrievedDocs.forEach((doc, idx) => {
    const filename = doc.metadata.filename || 'Document.pdf';
    const page = doc.metadata.page;
    const pageLabel = page ? ` (Page ${page})` : '';

    contextBlocks.push(
      `--- CONTEXT BLOCK ${idx + 1} [Source: ${filename}${pageLabel}] ---\n${doc.content}\n`
    );

    const sourceKey = `${filename}:${page || 'N/A'}`;
    if (!sourcesMap.has(sourceKey)) {
      const snippet = doc.content.slice(0, 150).replace(/\s+/g, ' ') + '...';
      sourcesMap.set(sourceKey, {
        filename,
        page,
        snippet,
      });
    }
  });

  return {
    contextText: contextBlocks.join('\n'),
    sources: Array.from(sourcesMap.values()),
  };
}

export async function generateAnswerWithContext(
  question: string,
  contextText: string,
  chatHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [],
  onToken?: (token: string) => void
): Promise<string> {
  const systemPrompt = `You are a helpful, precise AI assistant that answers user questions based ONLY on the provided PDF document context.

DOCUMENT CONTEXT:
${contextText}

INSTRUCTIONS:
1. Base your answer directly on the information provided in the document context.
2. When mentioning facts from specific documents or pages, reference the filename and page number clearly (e.g., "According to document.pdf on page 2...").
3. If the answer cannot be found in the context, politely state: "I'm sorry, but I couldn't find the answer to your question in the uploaded PDF documents." Do not invent information.
4. Keep your answer clear, accurate, and professional.`;

  const messages: (SystemMessage | HumanMessage | AIMessage)[] = [
    new SystemMessage(systemPrompt),
  ];

  // Include recent chat history (up to last 6 messages)
  const recentHistory = chatHistory.slice(-6);
  for (const msg of recentHistory) {
    if (msg.role === 'user') {
      messages.push(new HumanMessage(msg.content));
    } else if (msg.role === 'assistant') {
      messages.push(new AIMessage(msg.content));
    }
  }

  messages.push(new HumanMessage(question));

  if (onToken) {
    let fullAnswer = '';
    // Obtain stream using retry & fallback BEFORE piping tokens
    const stream = await executeWithRetryAndFallback(async (modelName) => {
      const chatModel = getChatModel(true, modelName);
      return await chatModel.stream(messages);
    });

    for await (const chunk of stream) {
      const text = typeof chunk.content === 'string' ? chunk.content : JSON.stringify(chunk.content);
      if (text) {
        fullAnswer += text;
        onToken(text);
      }
    }
    return fullAnswer;
  } else {
    const response = await executeWithRetryAndFallback(async (modelName) => {
      const chatModel = getChatModel(false, modelName);
      return await chatModel.invoke(messages);
    });

    return typeof response.content === 'string'
      ? response.content
      : JSON.stringify(response.content);
  }
}
