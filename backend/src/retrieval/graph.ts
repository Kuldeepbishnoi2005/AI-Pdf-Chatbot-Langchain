import { StateGraph, Annotation, START, END } from '@langchain/langgraph';
import { searchVectorStore } from './retriever.js';
import { constructContextAndSources, generateAnswerWithContext } from './generator.js';
import { SearchResultDoc, SourceReference } from '../shared/types.js';

export const RetrievalAnnotation = Annotation.Root({
  question: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => '',
  }),
  chatHistory: Annotation<Array<{ role: 'user' | 'assistant'; content: string }>>({
    reducer: (x, y) => y ?? x,
    default: () => [],
  }),
  retrievedDocs: Annotation<SearchResultDoc[]>({
    reducer: (x, y) => y ?? x,
    default: () => [],
  }),
  contextText: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => '',
  }),
  answer: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => '',
  }),
  sources: Annotation<SourceReference[]>({
    reducer: (x, y) => y ?? x,
    default: () => [],
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

async function receiveQuestionNode(state: typeof RetrievalAnnotation.State) {
  if (!state.question || state.question.trim().length === 0) {
    throw new Error('No question provided for retrieval graph.');
  }
  return {
    status: 'retrieving',
  };
}

async function retrieveDocsNode(state: typeof RetrievalAnnotation.State) {
  console.log(`[Retrieval Graph] Searching vectors for query: "${state.question}"`);
  const docs = await searchVectorStore(state.question, 5);

  return {
    retrievedDocs: docs,
  };
}

async function constructContextNode(state: typeof RetrievalAnnotation.State) {
  const { contextText, sources } = constructContextAndSources(state.retrievedDocs);
  return {
    contextText,
    sources,
    status: 'generating',
  };
}

async function generateAnswerNode(state: typeof RetrievalAnnotation.State) {
  console.log('[Retrieval Graph] Generating LLM response...');
  const answer = await generateAnswerWithContext(
    state.question,
    state.contextText,
    state.chatHistory
  );

  return {
    answer,
    status: 'completed',
  };
}

const builder = new StateGraph(RetrievalAnnotation)
  .addNode('receiveQuestion', receiveQuestionNode)
  .addNode('retrieveDocs', retrieveDocsNode)
  .addNode('constructContext', constructContextNode)
  .addNode('generateAnswer', generateAnswerNode)
  .addEdge(START, 'receiveQuestion')
  .addEdge('receiveQuestion', 'retrieveDocs')
  .addEdge('retrieveDocs', 'constructContext')
  .addEdge('constructContext', 'generateAnswer')
  .addEdge('generateAnswer', END);

export const retrievalGraph = builder.compile();
