'use client';

import React from 'react';
import { FileText, Bookmark } from 'lucide-react';
import { SourceReference } from '@/lib/types';

interface SourceCardProps {
  source: SourceReference;
}

export const SourceCard: React.FC<SourceCardProps> = ({ source }) => {
  return (
    <div className="bg-surface rounded-xl border border-border p-3 space-y-2 shadow-subtle hover:border-primary-200 transition-all text-left">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="font-semibold text-heading truncate flex items-center gap-1.5" title={source.filename}>
          <FileText className="w-3.5 h-3.5 text-primary-600 shrink-0" />
          <span className="truncate">{source.filename}</span>
        </span>
        {source.page && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md border border-primary-200 shrink-0">
            <Bookmark className="w-3 h-3 text-primary-600" />
            Page {source.page}
          </span>
        )}
      </div>

      <p className="text-[11px] text-subtext leading-relaxed line-clamp-3 bg-background p-2 rounded-lg border border-border/60 italic font-sans">
        &ldquo;{source.snippet}&rdquo;
      </p>
    </div>
  );
};
