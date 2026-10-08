'use client';

import React from 'react';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Settings,
  Bot,
  Server,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { InstallButton } from '../pwa/InstallButton';

export type TabType = 'dashboard' | 'documents' | 'chat' | 'settings';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  documentCount: number;
  isBackendConnected: boolean | null;
  apiUrl: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  documentCount,
  isBackendConnected,
  apiUrl,
}) => {
  const navItems = [
    {
      id: 'dashboard' as TabType,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'documents' as TabType,
      label: 'Documents',
      icon: FileText,
      badge: documentCount > 0 ? documentCount : null,
    },
    {
      id: 'chat' as TabType,
      label: 'Chat Assistant',
      icon: MessageSquare,
      badge: null,
    },
    {
      id: 'settings' as TabType,
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-surface shrink-0 h-screen sticky top-0 select-none">
      {/* Brand / Logo */}
      <div className="p-6 border-b border-border/60 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary-600 text-white flex items-center justify-center shadow-md shadow-primary-600/20">
          <Bot className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="font-bold text-heading text-base tracking-tight">AI PDF Chatbot</h1>
          </div>
          <p className="text-xs text-subtext font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-primary-600" /> Educational RAG
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-semibold text-subtext uppercase tracking-wider">
          Main Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary-600 text-white shadow-sm shadow-primary-600/25'
                  : 'text-subtext hover:text-heading hover:bg-surface-hover'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-subtext'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== null && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-primary-50 text-primary-600 border border-primary-200'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* PWA Install Button Card */}
      <div className="px-4 pb-2">
        <InstallButton variant="sidebar" />
      </div>

      {/* Footer System Status Card */}
      <div className="p-4 border-t border-border/60">
        <div className="p-3.5 rounded-xl bg-background border border-border space-y-2.5">
          <div className="flex items-center justify-between text-xs font-semibold text-heading">
            <span className="flex items-center gap-1.5 text-subtext">
              <Server className="w-3.5 h-3.5 text-primary-600" /> Backend Status
            </span>
            {isBackendConnected === true && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" /> Online
              </span>
            )}
            {isBackendConnected === false && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                <AlertCircle className="w-3 h-3" /> Offline
              </span>
            )}
            {isBackendConnected === null && (
              <span className="text-subtext text-[11px] animate-pulse">Checking...</span>
            )}
          </div>
          <div className="text-[11px] font-mono text-subtext truncate bg-surface px-2 py-1 rounded border border-border/80">
            {apiUrl}
          </div>
        </div>
      </div>
    </aside>
  );
};
