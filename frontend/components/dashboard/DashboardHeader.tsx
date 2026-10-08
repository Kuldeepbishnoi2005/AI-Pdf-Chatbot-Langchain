'use client';

import React from 'react';
import { Search, Server, CheckCircle2, AlertCircle, User } from 'lucide-react';
import { TabType } from './Sidebar';
import { InstallButton } from '../pwa/InstallButton';

interface DashboardHeaderProps {
  activeTab: TabType;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isBackendConnected: boolean | null;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  activeTab,
  searchQuery,
  setSearchQuery,
  isBackendConnected,
}) => {
  const titles: Record<TabType, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Dashboard Overview',
      subtitle: 'Manage your documents and monitor AI search stats.',
    },
    documents: {
      title: 'PDF Document Library',
      subtitle: 'Upload, manage, and inspect your processed PDF vector stores.',
    },
    chat: {
      title: 'Document AI Assistant',
      subtitle: 'Ask questions and stream answers grounded in your uploaded PDFs.',
    },
    settings: {
      title: 'System & API Settings',
      subtitle: 'Configure backend connection and inspect AI model parameters.',
    },
  };

  const current = titles[activeTab];

  return (
    <header className="bg-surface border-b border-border px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-20 shadow-subtle">
      <div>
        <h1 className="text-xl font-bold text-heading tracking-tight">{current.title}</h1>
        <p className="text-xs text-subtext font-normal">{current.subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Document Search Bar */}
        <div className="relative flex-1 md:w-64">
          <Search className="w-4 h-4 text-subtext absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-background border border-border rounded-xl text-xs text-heading placeholder-subtext focus:bg-surface transition-all"
          />
        </div>

        {/* Connection Status Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-background border border-border text-xs font-medium">
          <Server className="w-3.5 h-3.5 text-primary-600" />
          {isBackendConnected === true && (
            <span className="flex items-center gap-1 text-emerald-600 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Backend Online
            </span>
          )}
          {isBackendConnected === false && (
            <span className="flex items-center gap-1 text-amber-600 font-semibold">
              <AlertCircle className="w-3.5 h-3.5" /> Backend Offline
            </span>
          )}
          {isBackendConnected === null && (
            <span className="text-subtext animate-pulse">Checking...</span>
          )}
        </div>

        {/* PWA Install Button */}
        <InstallButton variant="header" />

        {/* Profile / Workspace Badge */}
        <div className="h-9 w-9 rounded-xl bg-primary-100 text-primary-700 font-bold flex items-center justify-center border border-primary-200">
          <User className="w-4 h-4 text-primary-600" />
        </div>
      </div>
    </header>
  );
};
