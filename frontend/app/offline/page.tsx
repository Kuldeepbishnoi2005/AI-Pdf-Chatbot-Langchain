'use client';

import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, AlertCircle, Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function OfflinePage() {
  const [isChecking, setIsChecking] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      window.location.href = '/';
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    setIsChecking(true);
    setTimeout(() => {
      if (navigator.onLine) {
        window.location.href = '/';
      } else {
        setIsChecking(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center font-sans antialiased">
      <div className="bg-surface rounded-3xl border border-border shadow-floating max-w-md w-full p-8 space-y-6">
        {/* Header Icon */}
        <div className="w-16 h-16 bg-surface-hover border border-border rounded-2xl flex items-center justify-center mx-auto text-primary-600 shadow-sm">
          <WifiOff className="w-8 h-8 text-primary-600" />
        </div>

        {/* Text Area */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">
            <AlertCircle className="w-3.5 h-3.5" /> Offline Mode Active
          </div>
          <h1 className="text-2xl font-bold text-heading">You are Currently Offline</h1>
          <p className="text-subtext text-sm leading-relaxed">
            AI PDF Chatbot requires an active internet connection to process document ingestion, perform vector search, and stream AI answers.
          </p>
        </div>

        {/* Feature Connection Matrix */}
        <div className="bg-background/80 rounded-2xl p-4 border border-border space-y-2 text-left text-xs">
          <div className="flex items-center justify-between text-subtext">
            <span>App Shell & Cached UI</span>
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Available
            </span>
          </div>
          <div className="flex items-center justify-between text-subtext">
            <span>PDF Upload & Ingestion</span>
            <span className="text-rose-500 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span> Requires Internet
            </span>
          </div>
          <div className="flex items-center justify-between text-subtext">
            <span>Gemini AI Retrieval & Chat</span>
            <span className="text-rose-500 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span> Requires Internet
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-2">
          <button
            onClick={handleRetry}
            disabled={isChecking}
            className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-2xl shadow-button transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Checking Connection...' : 'Retry Connection'}
          </button>

          <Link
            href="/"
            className="w-full py-2.5 px-4 bg-surface hover:bg-surface-hover border border-border text-subtext font-medium rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Dashboard
          </Link>
        </div>
      </div>

      {/* Footer Branding */}
      <p className="mt-8 text-xs text-subtext flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-primary-500" /> AI PDF Chatbot PWA Framework
      </p>
    </div>
  );
}
