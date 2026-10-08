'use client';

import React from 'react';
import { FolderOpen, Plus, FileSearch } from 'lucide-react';
import { IndexedDocument } from '@/lib/types';
import { DocumentCard } from './DocumentCard';

interface DocumentListProps {
  documents: IndexedDocument[];
  searchQuery: string;
  onDeleteDocument: (filename: string) => Promise<void>;
  onOpenUpload: () => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  searchQuery,
  onDeleteDocument,
  onOpenUpload,
}) => {
  const filteredDocs = documents.filter((doc) =>
    doc.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (documents.length === 0) {
    return (
      <div className="bg-surface rounded-2xl border border-border p-8 text-center space-y-4 shadow-card">
        <div className="h-14 w-14 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mx-auto border border-primary-100">
          <FolderOpen className="w-7 h-7" />
        </div>
        <div className="space-y-1 max-w-sm mx-auto">
          <h3 className="text-base font-bold text-heading">Your workspace is empty</h3>
          <p className="text-xs text-subtext">
            Upload a PDF document to extract chunks and begin querying with AI.
          </p>
        </div>
        <button
          onClick={onOpenUpload}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 text-white font-semibold text-xs shadow-md shadow-primary-600/20 hover:bg-primary-700 transition-all"
        >
          <Plus className="w-4 h-4" /> Upload First PDF
        </button>
      </div>
    );
  }

  if (filteredDocs.length === 0) {
    return (
      <div className="bg-surface rounded-2xl border border-border p-8 text-center space-y-3 shadow-card">
        <FileSearch className="w-8 h-8 text-subtext mx-auto" />
        <p className="text-sm font-bold text-heading">No matching documents found</p>
        <p className="text-xs text-subtext">
          No indexed document matches &quot;{searchQuery}&quot;. Try adjusting your search query.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-bold text-heading tracking-tight">
          Indexed Documents ({filteredDocs.length})
        </h3>
        <span className="text-xs text-subtext font-medium">
          Total Chunks:{' '}
          <strong className="text-primary-600 font-bold">
            {filteredDocs.reduce((acc, d) => acc + d.total_chunks, 0)}
          </strong>
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filteredDocs.map((doc) => (
          <DocumentCard key={doc.filename} document={doc} onDelete={onDeleteDocument} />
        ))}
      </div>
    </div>
  );
};
