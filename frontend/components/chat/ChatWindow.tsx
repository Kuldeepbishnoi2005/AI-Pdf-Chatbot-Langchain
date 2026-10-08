'use client';

import React, { useRef, useEffect } from 'react';
import {
  MessageSquare,
  Sparkles,
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import { ChatMessage as ChatMessageType, IndexedDocument } from '@/lib/types';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';

interface ChatWindowProps {
  messages: ChatMessageType[];
  indexedDocuments: IndexedDocument[];
  onSendMessage: (text: string) => void;
  onClearChat: () => void;
  isLoading: boolean;
  isBackendConnected: boolean | null;
  onOpenUpload: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  indexedDocuments,
  onSendMessage,
  onClearChat,
  isLoading,
  isBackendConnected,
  onOpenUpload,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const suggestedPrompts = [
    {
      label: 'Summarize Document',
      prompt: 'Summarize the main content and core points of the uploaded document.',
    },
    {
      label: 'Key Findings',
      prompt: 'What are the key findings and key insights detailed in this document?',
    },
    {
      label: 'Methodology & Data',
      prompt: 'Explain the methodology, framework, or data presented in this file.',
    },
    {
      label: 'Conclusions',
      prompt: 'What are the primary conclusions or future recommendations outlined?',
    },
  ];

  const hasDocuments = indexedDocuments.length > 0;

  return (
    <div className="bg-surface rounded-2xl border border-border shadow-card flex flex-col h-[calc(100vh-140px)] min-h-[550px] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border bg-surface flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center border border-primary-100">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-heading text-sm sm:text-base tracking-tight">
                Document Assistant
              </h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full border border-primary-200">
                <Sparkles className="w-3 h-3 text-primary-600" /> RAG Ready
              </span>
            </div>
            <p className="text-xs text-subtext flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-primary-600" />
              <span>
                {indexedDocuments.length}{' '}
                {indexedDocuments.length === 1 ? 'document' : 'documents'} indexed
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isBackendConnected === true && (
            <span className="hidden sm:inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" /> Online
            </span>
          )}
          {isBackendConnected === false && (
            <span className="hidden sm:inline-flex items-center gap-1 text-xs text-amber-600 font-semibold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              <AlertCircle className="w-3.5 h-3.5" /> Offline
            </span>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-background">
        {!hasDocuments ? (
          /* Empty State: No Documents */
          <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4 my-auto">
            <div className="h-16 w-16 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center border border-primary-100 shadow-sm">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div className="space-y-1.5 max-w-sm">
              <h3 className="text-base font-bold text-heading">Your workspace is empty</h3>
              <p className="text-xs text-subtext">
                Upload a PDF document first so Gemini can index text chunks and answer questions.
              </p>
            </div>
            <button
              onClick={onOpenUpload}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white font-semibold text-xs shadow-md shadow-primary-600/20 hover:bg-primary-700 transition-all"
            >
              <UploadCloud className="w-4 h-4" /> Upload PDF Document
            </button>
          </div>
        ) : messages.length === 0 ? (
          /* Empty State: Documents Exist, No Chat Yet */
          <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-6 my-auto max-w-2xl mx-auto">
            <div className="space-y-2">
              <div className="h-14 w-14 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mx-auto border border-primary-100">
                <HelpCircle className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-heading">Ask anything about your documents</h3>
              <p className="text-xs text-subtext">
                Gemini will search your {indexedDocuments.length} indexed PDF(s) and provide
                grounded responses with exact source citations.
              </p>
            </div>

            {/* Suggested Prompts Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
              {suggestedPrompts.map((sp, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(sp.prompt)}
                  className="p-3.5 rounded-2xl bg-surface border border-border hover:border-primary-300 hover:bg-primary-50/50 shadow-card hover:shadow-floating transition-all group space-y-1"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-heading group-hover:text-primary-600">
                    <span>{sp.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-subtext group-hover:text-primary-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-[11px] text-subtext line-clamp-2">&ldquo;{sp.prompt}&rdquo;</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Chat Message History */
          <div className="divide-y divide-border/40">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Sticky Bottom Input */}
      <ChatInput
        onSendMessage={onSendMessage}
        onClearChat={onClearChat}
        isLoading={isLoading}
        disabled={!hasDocuments}
      />
    </div>
  );
};
