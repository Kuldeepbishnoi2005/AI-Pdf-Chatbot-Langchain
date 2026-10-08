'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Trash2, Loader2, Sparkles } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onClearChat: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onClearChat,
  isLoading,
  disabled = false,
}) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [text]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (text.trim() && !isLoading && !disabled) {
      onSendMessage(text.trim());
      setText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="p-4 bg-surface border-t border-border sticky bottom-0 z-20 shadow-floating">
      <div className="max-w-3xl mx-auto space-y-2">
        <form
          onSubmit={handleSubmit}
          className="relative bg-background border border-border rounded-2xl p-2 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all flex items-end gap-2"
        >
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              disabled
                ? 'Upload a PDF document to enable chat assistant...'
                : 'Ask a question about your uploaded PDFs... (Shift + Enter for new line)'
            }
            disabled={disabled || isLoading}
            className="flex-1 bg-transparent text-sm text-heading placeholder-subtext p-2.5 resize-none focus:outline-none disabled:opacity-50 min-h-[42px] max-h-[140px]"
          />

          <div className="flex items-center gap-1.5 pb-1 pr-1">
            <button
              type="button"
              onClick={onClearChat}
              title="Clear chat history"
              className="p-2 rounded-xl text-subtext hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              type="submit"
              disabled={!text.trim() || isLoading || disabled}
              className="p-2.5 rounded-xl bg-primary-600 text-white shadow-md shadow-primary-600/20 hover:bg-primary-700 disabled:opacity-40 disabled:pointer-events-none transition-all"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </form>

        <div className="flex items-center justify-between text-[11px] text-subtext px-2">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-primary-600" /> Grounded RAG search active
          </span>
          <span>Shift + Enter = new line</span>
        </div>
      </div>
    </div>
  );
};
