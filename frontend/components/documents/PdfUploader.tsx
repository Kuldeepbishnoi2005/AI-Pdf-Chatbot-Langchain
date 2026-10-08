'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { ApiClient } from '@/lib/api-client';

interface PdfUploaderProps {
  onUploadSuccess: () => void;
}

export const PdfUploader: React.FC<PdfUploaderProps> = ({ onUploadSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ count: number; files: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: File[]) => {
    const pdfFiles = files.filter((f) => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
    if (pdfFiles.length === 0) {
      setError('Please select valid PDF documents (.pdf format).');
      return;
    }

    // Check 50MB file size limit
    const oversized = pdfFiles.find((f) => f.size > 50 * 1024 * 1024);
    if (oversized) {
      setError(`File "${oversized.name}" exceeds the 50 MB limit.`);
      return;
    }

    setError(null);
    setSuccessInfo(null);
    setIsUploading(true);
    setStatusMessage('Extracting text and generating embeddings...');

    try {
      const result = await ApiClient.uploadPdfs(pdfFiles, (msg) => {
        setStatusMessage(msg);
      });

      setSuccessInfo({
        count: result.storedCount,
        files: result.filesProcessed,
      });

      onUploadSuccess();
    } catch (err) {
      setError((err as Error).message || 'Failed to process and index PDF documents.');
    } finally {
      setIsUploading(false);
      setStatusMessage('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <div className="bg-surface rounded-2xl border border-border p-6 shadow-card hover:shadow-floating transition-all space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-heading tracking-tight flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-primary-600" /> Upload Documents
          </h2>
          <p className="text-xs text-subtext font-normal">
            Ingest PDFs to create 1536d vector embeddings in Supabase.
          </p>
        </div>
        <span className="text-[11px] font-semibold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-full border border-primary-200">
          Max 50 MB / file
        </span>
      </div>

      {/* Dashed Drop Zone */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
          isDragging
            ? 'border-primary-600 bg-primary-50/60 scale-[1.01]'
            : 'border-border bg-background hover:border-primary-500/50 hover:bg-surface-hover'
        } ${isUploading ? 'pointer-events-none opacity-80' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFiles(Array.from(e.target.files));
            }
          }}
        />

        <div className="h-12 w-12 rounded-2xl bg-primary-100 text-primary-600 flex items-center justify-center border border-primary-200 shadow-sm">
          {isUploading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <FileText className="w-6 h-6" />
          )}
        </div>

        {isUploading ? (
          <div className="space-y-1">
            <p className="text-sm font-bold text-heading">Processing Documents...</p>
            <p className="text-xs text-primary-600 font-medium animate-pulse">{statusMessage}</p>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-sm font-bold text-heading">
              Drop PDF files here or <span className="text-primary-600 underline">browse</span>
            </p>
            <p className="text-xs text-subtext">Supports multi-page PDF files up to 50 MB each.</p>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] text-subtext">
          <span className="px-2 py-0.5 rounded-md bg-surface border border-border font-medium">
            PDF Support
          </span>
          <span className="px-2 py-0.5 rounded-md bg-surface border border-border font-medium">
            Recursive Text Splitter
          </span>
          <span className="px-2 py-0.5 rounded-md bg-surface border border-border font-medium">
            Gemini Embeddings (1536d)
          </span>
        </div>
      </div>

      {/* Success Notification */}
      {successInfo && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1 flex-1">
            <p className="font-bold text-emerald-900">
              Successfully ingested {successInfo.files.length} document(s)!
            </p>
            <p className="text-emerald-700">
              Stored <span className="font-semibold">{successInfo.count} text chunks</span> in
              Supabase pgvector. You can now query them in the chat assistant.
            </p>
          </div>
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-rose-900">Upload Failed</p>
            <p className="text-rose-700">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};
