'use client';

import React, { useState } from 'react';
import {
  Settings,
  Server,
  Database,
  Cpu,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { ApiClient } from '@/lib/api-client';
import { InstallButton } from '../pwa/InstallButton';

interface SettingsViewProps {
  apiUrl: string;
  isBackendConnected: boolean | null;
  onRefreshHealth: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  apiUrl,
  isBackendConnected,
  onRefreshHealth,
}) => {
  const [isTesting, setIsTesting] = useState(false);

  const handleTestConnection = async () => {
    setIsTesting(true);
    await onRefreshHealth();
    setTimeout(() => setIsTesting(false), 500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-surface rounded-2xl border border-border p-6 shadow-card space-y-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center border border-primary-100">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-heading tracking-tight">System & API Overview</h2>
            <p className="text-xs text-subtext">
              Inspect backend connection status, AI model architecture, and database vector parameters.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Backend Connectivity */}
        <div className="bg-surface rounded-2xl border border-border p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="font-bold text-heading text-sm flex items-center gap-2">
              <Server className="w-4 h-4 text-primary-600" /> Backend Server API
            </h3>
            {isBackendConnected === true && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" /> Connected
              </span>
            )}
            {isBackendConnected === false && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                <AlertCircle className="w-3.5 h-3.5" /> Disconnected
              </span>
            )}
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-subtext font-medium block mb-1">API Base URL</label>
              <div className="p-2.5 rounded-xl bg-background border border-border font-mono text-heading">
                {apiUrl}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-subtext">Health Check Endpoint</span>
              <span className="font-mono text-heading font-medium">{apiUrl}/health</span>
            </div>

            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary-50 hover:bg-primary-100 text-primary-700 font-semibold border border-primary-200 transition-all text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Testing Connection...' : 'Test Backend Connection'}</span>
            </button>
          </div>
        </div>

        {/* AI Models & Infrastructure */}
        <div className="bg-surface rounded-2xl border border-border p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="font-bold text-heading text-sm flex items-center gap-2">
              <Cpu className="w-4 h-4 text-primary-600" /> AI Provider & Models
            </h3>
            <span className="text-xs font-semibold text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-full border border-primary-200">
              Google Gemini
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-background border border-border">
              <span className="text-subtext font-medium">Chat Generation Model</span>
              <span className="font-bold text-heading">gemini-3.8-flash</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-background border border-border">
              <span className="text-subtext font-medium">Vector Embedding Model</span>
              <span className="font-bold text-heading">gemini-embedding-2</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-background border border-border">
              <span className="text-subtext font-medium">Embedding Dimension</span>
              <span className="font-bold text-primary-600">1536-d (Gemini Embeddings Wrapper)</span>
            </div>
          </div>
        </div>

        {/* Supabase Vector Database */}
        <div className="bg-surface rounded-2xl border border-border p-5 shadow-card space-y-4 md:col-span-2">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="font-bold text-heading text-sm flex items-center gap-2">
              <Database className="w-4 h-4 text-primary-600" /> Vector Database Architecture
            </h3>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Supabase pgvector
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-background border border-border space-y-1">
              <span className="text-subtext font-medium block">Vector Schema</span>
              <span className="font-mono text-heading font-bold">documents (embedding vector(1536))</span>
            </div>
            <div className="p-3.5 rounded-xl bg-background border border-border space-y-1">
              <span className="text-subtext font-medium block">Vector Similarity Search</span>
              <span className="font-mono text-heading font-bold">match_documents (RPC cosine)</span>
            </div>
            <div className="p-3.5 rounded-xl bg-background border border-border space-y-1">
              <span className="text-subtext font-medium block">Orchestration Framework</span>
              <span className="font-mono text-heading font-bold">LangGraph + LangChain JS</span>
            </div>
          </div>
        </div>

        {/* Progressive Web App Status & Installation */}
        <div className="bg-surface rounded-2xl border border-border p-5 shadow-card space-y-4 md:col-span-2">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="font-bold text-heading text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary-600" /> Progressive Web App (PWA)
            </h3>
            <span className="text-xs font-semibold text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-full border border-primary-200">
              Standalone Ready
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-background p-4 rounded-xl border border-border">
            <div className="space-y-1 text-xs">
              <div className="font-bold text-heading">PWA Installation & Offline Support</div>
              <p className="text-subtext">
                Install AI PDF Chatbot on Windows, macOS, Android, or iOS for a native standalone application experience.
              </p>
            </div>
            <InstallButton variant="settings" />
          </div>
        </div>
      </div>
    </div>
  );
};
