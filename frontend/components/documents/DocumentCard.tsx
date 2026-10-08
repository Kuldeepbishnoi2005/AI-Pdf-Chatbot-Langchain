'use client';

import React, { useState } from 'react';
import { FileText, Trash2, CheckCircle2, Layers, Calendar, Loader2 } from 'lucide-react';
import { IndexedDocument } from '@/lib/types';

interface DocumentCardProps {
  document: IndexedDocument;
  onDelete: (filename: string) => Promise<void>;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ document, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete all vector chunks for "${document.filename}"?`)) {
      setIsDeleting(true);
      try {
        await onDelete(document.filename);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const formattedDate = document.created_at
    ? new Date(document.created_at).toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recently';

  return (
    <div className="bg-surface rounded-2xl border border-border p-4 shadow-card hover:shadow-floating transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-start sm:items-center gap-3.5 min-w-0">
        <div className="h-11 w-11 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center border border-primary-100 shrink-0">
          <FileText className="w-5 h-5" />
        </div>

        <div className="min-w-0 space-y-1">
          <h3 className="font-bold text-heading text-sm truncate tracking-tight" title={document.filename}>
            {document.filename}
          </h3>

          <div className="flex flex-wrap items-center gap-3 text-xs text-subtext">
            <span className="flex items-center gap-1 font-medium text-heading">
              <Layers className="w-3.5 h-3.5 text-primary-600" />
              {document.total_chunks} {document.total_chunks === 1 ? 'chunk' : 'chunks'}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-subtext" />
              {formattedDate}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3 h-3" /> Indexed
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-2 border-t sm:border-t-0 border-border/60 pt-3 sm:pt-0 shrink-0">
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          aria-label={`Delete document ${document.filename}`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all disabled:opacity-50"
        >
          {isDeleting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Trash2 className="w-3.5 h-3.5" />
          )}
          <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
        </button>
      </div>
    </div>
  );
};
