'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar, TabType } from '@/components/dashboard/Sidebar';
import { MobileNav } from '@/components/dashboard/MobileNav';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { PdfUploader } from '@/components/documents/PdfUploader';
import { DocumentList } from '@/components/documents/DocumentList';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { SettingsView } from '@/components/dashboard/SettingsView';
import { ApiClient } from '@/lib/api-client';
import { IndexedDocument, ChatMessage, SourceReference } from '@/lib/types';
import {
  FileText,
  Layers,
  Cpu,
  Server,
  Sparkles,
  UploadCloud,
  MessageSquare,
  X,
  Plus,
  ArrowRight,
} from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [indexedDocuments, setIndexedDocuments] = useState<IndexedDocument[]>([]);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean | null>(null);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_LANGGRAPH_API_URL ||
    'http://localhost:2024';

  const checkHealth = useCallback(async () => {
    const isOk = await ApiClient.checkBackendHealth();
    setIsBackendConnected(isOk);
  }, []);

  const loadDocuments = useCallback(async () => {
    const docs = await ApiClient.fetchIndexedDocuments();
    setIndexedDocuments(docs);
  }, []);

  useEffect(() => {
    checkHealth();
    loadDocuments();
  }, [checkHealth, loadDocuments]);

  const handleUploadSuccess = () => {
    loadDocuments();
    setIsUploadModalOpen(false);
  };

  const handleDeleteDocument = async (filename: string) => {
    const success = await ApiClient.deleteDocument(filename);
    if (success) {
      setIndexedDocuments((prev) => prev.filter((d) => d.filename !== filename));
    } else {
      alert(`Failed to delete document ${filename}`);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isChatLoading) return;

    const userMessageId = `user-${Date.now()}`;
    const assistantMessageId = `assistant-${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newUserMsg: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: text,
      timestamp,
    };

    const newAssistantMsg: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp,
      isStreaming: true,
      sources: [],
    };

    const updatedMessages = [...messages, newUserMsg];
    setMessages([...updatedMessages, newAssistantMsg]);
    setIsChatLoading(true);

    const historyPayload = updatedMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    let accumulatedContent = '';

    await ApiClient.streamChat(text, historyPayload, {
      onSources: (sources: SourceReference[]) => {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === assistantMessageId ? { ...msg, sources } : msg))
        );
      },
      onToken: (token: string) => {
        accumulatedContent += token;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId ? { ...msg, content: accumulatedContent } : msg
          )
        );
      },
      onError: (errMessage: string) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? {
                  ...msg,
                  content: `Error: ${errMessage}`,
                  isStreaming: false,
                }
              : msg
          )
        );
        setIsChatLoading(false);
      },
      onComplete: () => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId ? { ...msg, isStreaming: false } : msg
          )
        );
        setIsChatLoading(false);
      },
    });
  };

  const handleClearChat = () => {
    if (messages.length > 0 && confirm('Are you sure you want to clear your chat history?')) {
      setMessages([]);
    }
  };

  const totalChunks = indexedDocuments.reduce((acc, doc) => acc + doc.total_chunks, 0);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-background text-heading">
      {/* Desktop Persistent Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        documentCount={indexedDocuments.length}
        isBackendConnected={isBackendConnected}
        apiUrl={apiUrl}
      />

      {/* Mobile Header & Bottom Navigation */}
      <MobileNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        documentCount={indexedDocuments.length}
        isBackendConnected={isBackendConnected}
        apiUrl={apiUrl}
      />

      {/* Main Content View Container */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <DashboardHeader
          activeTab={activeTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isBackendConnected={isBackendConnected}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
          {/* TAB 1: DASHBOARD VIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Welcome Section */}
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-3xl p-6 sm:p-8 text-white shadow-floating relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-2 z-10 max-w-xl">
                  <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Gemini 3.8 Flash & Supabase RAG</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    Your documents, understood.
                  </h2>
                  <p className="text-sm text-white/80 leading-relaxed font-normal">
                    Upload PDFs and ask questions using AI-powered vector similarity document search.
                  </p>
                </div>

                <div className="z-10 shrink-0 flex items-center gap-3">
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-primary-700 font-bold text-xs shadow-lg hover:bg-primary-50 transition-all"
                  >
                    <UploadCloud className="w-4 h-4 text-primary-600" /> Upload PDF
                  </button>
                  <button
                    onClick={() => setActiveTab('chat')}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/20 transition-all"
                  >
                    <MessageSquare className="w-4 h-4" /> Open Chat
                  </button>
                </div>

                {/* Decorative BG element */}
                <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                  title="Indexed Documents"
                  value={indexedDocuments.length}
                  subtitle={
                    indexedDocuments.length === 1
                      ? '1 file active in store'
                      : `${indexedDocuments.length} files active in store`
                  }
                  icon={FileText}
                  badgeText="PDF Format"
                  accentColor="purple"
                />

                <StatsCard
                  title="Indexed Chunks"
                  value={totalChunks}
                  subtitle="1536-d vector embeddings"
                  icon={Layers}
                  badgeText="pgvector"
                  accentColor="orange"
                />

                <StatsCard
                  title="AI Model"
                  value="gemini-3.8-flash"
                  subtitle="gemini-embedding-2"
                  icon={Cpu}
                  badgeText="Google Gemini"
                  accentColor="pink"
                />

                <StatsCard
                  title="Backend Status"
                  value={
                    isBackendConnected === true
                      ? 'Online'
                      : isBackendConnected === false
                      ? 'Offline'
                      : 'Checking'
                  }
                  subtitle={`Port ${apiUrl.split(':').pop() || '2024'}`}
                  icon={Server}
                  badgeText={isBackendConnected ? 'Active' : 'Alert'}
                  accentColor="emerald"
                />
              </div>

              {/* Document Management & Upload Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <PdfUploader onUploadSuccess={handleUploadSuccess} />
                </div>
                <div className="lg:col-span-2">
                  <div className="bg-surface rounded-2xl border border-border p-6 shadow-card space-y-4">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <div>
                        <h3 className="text-base font-bold text-heading">Recent Documents</h3>
                        <p className="text-xs text-subtext">Manage active document embeddings.</p>
                      </div>
                      <button
                        onClick={() => setActiveTab('documents')}
                        className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                      >
                        View All <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <DocumentList
                      documents={indexedDocuments}
                      searchQuery={searchQuery}
                      onDeleteDocument={handleDeleteDocument}
                      onOpenUpload={() => setIsUploadModalOpen(true)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DOCUMENTS VIEW */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              <PdfUploader onUploadSuccess={handleUploadSuccess} />
              <div className="bg-surface rounded-2xl border border-border p-6 shadow-card">
                <DocumentList
                  documents={indexedDocuments}
                  searchQuery={searchQuery}
                  onDeleteDocument={handleDeleteDocument}
                  onOpenUpload={() => setIsUploadModalOpen(true)}
                />
              </div>
            </div>
          )}

          {/* TAB 3: CHAT VIEW */}
          {activeTab === 'chat' && (
            <ChatWindow
              messages={messages}
              indexedDocuments={indexedDocuments}
              onSendMessage={handleSendMessage}
              onClearChat={handleClearChat}
              isLoading={isChatLoading}
              isBackendConnected={isBackendConnected}
              onOpenUpload={() => setIsUploadModalOpen(true)}
            />
          )}

          {/* TAB 4: SETTINGS VIEW */}
          {activeTab === 'settings' && (
            <SettingsView
              apiUrl={apiUrl}
              isBackendConnected={isBackendConnected}
              onRefreshHealth={checkHealth}
            />
          )}
        </main>
      </div>

      {/* Quick Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-heading/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl border border-border shadow-floating max-w-lg w-full p-6 space-y-4 relative">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-heading text-base flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary-600" /> Upload PDF Document
              </h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 rounded-lg text-subtext hover:bg-surface-hover"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <PdfUploader onUploadSuccess={handleUploadSuccess} />
          </div>
        </div>
      )}
    </div>
  );
}
