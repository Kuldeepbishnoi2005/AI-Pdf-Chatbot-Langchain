'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import { WifiOff, Download, Sparkles, X, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PwaContextType {
  isInstalled: boolean;
  canInstall: boolean;
  isOffline: boolean;
  triggerInstall: () => void;
  showIosInstructions: boolean;
  setShowIosInstructions: (show: boolean) => void;
}

const PwaContext = createContext<PwaContextType>({
  isInstalled: false,
  canInstall: false,
  isOffline: false,
  triggerInstall: () => {},
  showIosInstructions: false,
  setShowIosInstructions: () => {},
});

export const usePwa = () => useContext(PwaContext);

export function PwaManager({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [showIosInstructions, setShowIosInstructions] = useState<boolean>(false);

  useEffect(() => {
    // 1. Service Worker Registration
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[PWA] Service Worker registered:', reg.scope);
        })
        .catch((err) => {
          console.warn('[PWA] Service Worker registration failed:', err);
        });
    }

    // 2. Detect Standalone / Installed state
    const checkIsStandalone = () => {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (navigator as any).standalone ||
        document.referrer.includes('android-app://');
      setIsInstalled(!!isStandalone);
    };

    checkIsStandalone();

    // 3. Network Connectivity Listener
    const updateOnlineStatus = () => {
      setIsOffline(!navigator.onLine);
    };

    updateOnlineStatus();
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // 4. Install Prompt Listener
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      console.log('[PWA] Application successfully installed.');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const triggerInstall = async () => {
    // Check if iOS Safari
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (isIos && !isInstalled) {
      setShowIosInstructions(true);
      return;
    }

    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('[PWA] User accepted install prompt');
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };

  return (
    <PwaContext.Provider
      value={{
        isInstalled,
        canInstall: !!deferredPrompt || (/iPad|iPhone|iPod/.test(navigator.userAgent) && !isInstalled),
        isOffline,
        triggerInstall,
        showIosInstructions,
        setShowIosInstructions,
      }}
    >
      {/* Offline Toast Alert */}
      {isOffline && (
        <div className="bg-amber-500 text-white text-xs font-semibold px-4 py-2 flex items-center justify-between shadow-md z-50 sticky top-0 animate-fadeIn">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>You are currently offline. Document ingestion & AI chat require network connectivity.</span>
          </div>
        </div>
      )}

      {children}

      {/* iOS Safari Installation Modal */}
      {showIosInstructions && (
        <div className="fixed inset-0 bg-heading/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl border border-border shadow-floating max-w-sm w-full p-6 space-y-4 relative">
            <button
              onClick={() => setShowIosInstructions(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-subtext hover:bg-surface-hover"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600">
              <Download className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-heading text-base">Install on iOS Safari</h3>
              <p className="text-subtext text-xs leading-relaxed">
                Follow these simple steps to add AI PDF Chatbot to your iPhone or iPad home screen:
              </p>
            </div>

            <div className="bg-background rounded-2xl p-3 border border-border space-y-2.5 text-xs text-heading">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-xs">
                  1
                </span>
                <span>
                  Tap the <Share className="w-3.5 h-3.5 inline text-primary-600 mx-0.5" /> <strong>Share</strong> button in Safari's bottom toolbar.
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-xs">
                  2
                </span>
                <span>
                  Scroll down and tap <strong>Add to Home Screen</strong>.
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-xs">
                  3
                </span>
                <span>
                  Tap <strong>Add</strong> in the top right corner.
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowIosInstructions(false)}
              className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-2xl text-xs shadow-button transition-all"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </PwaContext.Provider>
  );
}
