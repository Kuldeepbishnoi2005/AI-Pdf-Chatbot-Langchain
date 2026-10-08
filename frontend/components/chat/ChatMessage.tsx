'use client';

import React, { useState } from 'react';
import { Bot, User, Copy, Check, Sparkles } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '@/lib/types';
import { SourceCard } from './SourceCard';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  if (isUser) {
    return (
      <div className="py-4 px-4 sm:px-6 flex justify-end">
        <div className="flex items-start gap-3 max-w-2xl">
          <div className="bg-primary-600 text-white rounded-2xl rounded-tr-sm p-4 shadow-sm space-y-1">
            <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{message.content}</p>
            <span className="text-[10px] text-white/70 block text-right font-mono">{message.timestamp}</span>
          </div>
          <div className="h-8 w-8 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center shrink-0 border border-primary-200">
            <User className="w-4 h-4 text-primary-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-5 px-4 sm:px-6 bg-surface/50 border-y border-border/40">
      <div className="max-w-3xl mx-auto flex items-start gap-3.5">
        <div className="h-9 w-9 rounded-xl bg-primary-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-primary-600/20">
          <Bot className="w-5 h-5" />
        </div>

        <div className="flex-1 space-y-3 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-heading text-sm">Document Assistant</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary-50 text-primary-700 border border-primary-200">
                <Sparkles className="w-3 h-3 text-primary-600" /> Gemini RAG
              </span>
            </div>

            {message.content && !message.isStreaming && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs text-subtext hover:text-heading px-2 py-1 rounded-md hover:bg-surface border border-transparent hover:border-border transition-all"
                title="Copy response"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-medium">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="text-sm text-heading leading-relaxed font-sans whitespace-pre-wrap space-y-2">
            {message.content ? (
              <p>{message.content}</p>
            ) : message.isStreaming ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-primary-600 font-medium animate-pulse">
                <span className="h-2 w-2 rounded-full bg-primary-600 animate-ping" />
                Retrieving context & generating answer...
              </span>
            ) : (
              <span className="text-subtext italic">No response content.</span>
            )}
            {message.isStreaming && message.content && (
              <span className="inline-block w-2 h-4 bg-primary-600 ml-1 animate-pulse" />
            )}
          </div>

          {/* Render Source Cards if present */}
          {message.sources && message.sources.length > 0 && (
            <div className="pt-3 border-t border-border space-y-2">
              <span className="text-xs font-bold text-subtext uppercase tracking-wider block">
                Cited Sources ({message.sources.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {message.sources.map((src, idx) => (
                  <SourceCard key={idx} source={src} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
