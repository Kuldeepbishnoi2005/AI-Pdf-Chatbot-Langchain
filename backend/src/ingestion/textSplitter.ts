import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { PageDocument } from './pdfParser.js';

export interface DocumentChunk {
  pageContent: string;
  metadata: {
    filename: string;
    page: number;
    totalPages: number;
    chunkIndex: number;
  };
}

export async function splitDocuments(
  documents: PageDocument[],
  chunkSize = 1000,
  chunkOverlap = 200
): Promise<DocumentChunk[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap,
    separators: ['\n\n', '\n', ' ', ''],
  });

  const chunks: DocumentChunk[] = [];
  let globalChunkIndex = 0;

  for (const doc of documents) {
    const splitTexts = await splitter.splitText(doc.pageContent);
    for (let i = 0; i < splitTexts.length; i++) {
      const text = splitTexts[i].trim();
      if (text.length > 0) {
        chunks.push({
          pageContent: text,
          metadata: {
            ...doc.metadata,
            chunkIndex: globalChunkIndex++,
          },
        });
      }
    }
  }

  return chunks;
}
