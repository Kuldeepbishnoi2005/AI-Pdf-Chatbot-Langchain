'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Settings,
  Bot,
  Menu,
  X,
  Server,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { TabType } from './Sidebar';

interface MobileNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  documentCount: number;
  isBackendConnected: boolean | null;
  apiUrl: string;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  setActiveTab,
  documentCount,
  isBackendConnected,
  apiUrl,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'documents' as TabType, label: 'Documents', icon: FileText, badge: documentCount },
    { id: 'chat' as TabType, label: 'Chat', icon: MessageSquare },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
  ];

  const handleSelectTab = (tab: TabType) => {
    setActiveTab(tab);
    setIsOpen(false);
  };

  return (
    <>
      {/* Top Header Bar on Mobile/Tablet (< 1024px) */}
      <header className="lg:hidden h-14 bg-surface border-b border-border px-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary-600 text-white flex items-center justify-center font-bold">
            <Bot className="h-4 w-4" />
          </div>
          <span className="font-bold text-heading text-sm">AI PDF Chatbot</span>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation drawer"
          className="p-2 rounded-lg text-subtext hover:text-heading hover:bg-surface-hover transition-colors"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Drawer Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 bg-heading/20 backdrop-blur-sm z-50 flex flex-col justify-between p-4 transition-all">
          <div className="bg-surface rounded-2xl shadow-floating border border-border p-5 space-y-4 max-w-sm w-full mx-auto my-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary-600" />
                <span className="font-bold text-heading text-base">Navigation</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-subtext hover:bg-surface-hover"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'text-subtext hover:bg-surface-hover'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge ? (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          isActive ? 'bg-white/20 text-white' : 'bg-primary-100 text-primary-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-border space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-subtext font-medium flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-primary-600" /> Backend
                </span>
                {isBackendConnected === true && (
                  <span className="text-emerald-600 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Online
                  </span>
                )}
                {isBackendConnected === false && (
                  <span className="text-amber-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Offline
                  </span>
                )}
              </div>
              <div className="text-[11px] font-mono text-subtext truncate bg-background p-2 rounded border border-border">
                {apiUrl}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar on Mobile (< 768px) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface border-t border-border px-2 flex items-center justify-around z-40 shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
                isActive ? 'text-primary-600 font-semibold' : 'text-subtext hover:text-heading'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
