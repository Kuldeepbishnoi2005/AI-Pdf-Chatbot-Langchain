'use client';

import React from 'react';
import { usePwa } from './PwaManager';
import { Download, CheckCircle2 } from 'lucide-react';

interface InstallButtonProps {
  variant?: 'sidebar' | 'header' | 'settings';
  className?: string;
}

export function InstallButton({ variant = 'sidebar', className = '' }: InstallButtonProps) {
  const { isInstalled, canInstall, triggerInstall } = usePwa();

  if (isInstalled) {
    if (variant === 'settings') {
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5" /> Installed PWA
        </div>
      );
    }
    return null;
  }

  if (!canInstall && variant !== 'settings') {
    return null;
  }

  if (variant === 'header') {
    return (
      <button
        onClick={triggerInstall}
        aria-label="Install AI PDF Chatbot App"
        className={`px-3 py-1.5 bg-primary-50 hover:bg-primary-100 border border-primary-200 text-primary-700 font-semibold text-xs rounded-full transition-all duration-200 flex items-center gap-1.5 shadow-sm active:scale-95 ${className}`}
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  if (variant === 'settings') {
    return (
      <button
        onClick={triggerInstall}
        aria-label="Install Progressive Web App"
        className={`px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs rounded-xl shadow-button transition-all duration-200 flex items-center gap-2 ${className}`}
      >
        <Download className="w-4 h-4" />
        <span>Install Desktop / Mobile App</span>
      </button>
    );
  }

  // Sidebar variant
  return (
    <div className={`p-3 bg-surface-hover rounded-2xl border border-border space-y-2 ${className}`}>
      <div className="flex items-center gap-2 text-xs font-bold text-heading">
        <Download className="w-4 h-4 text-primary-600" /> Install Application
      </div>
      <p className="text-[11px] text-subtext leading-tight">
        Add PDF Chat to your home screen for quick standalone access.
      </p>
      <button
        onClick={triggerInstall}
        className="w-full py-1.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
      >
        <span>Install PWA</span>
      </button>
    </div>
  );
}
