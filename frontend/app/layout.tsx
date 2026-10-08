import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { PwaManager } from '@/components/pwa/PwaManager';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const viewport: Viewport = {
  themeColor: '#5925BC',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'AI PDF Chatbot | Educational RAG Dashboard',
  description:
    'SaaS AI PDF Chatbot built with Google Gemini 3.8 Flash, gemini-embedding-2, Supabase pgvector, and LangGraph.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AI PDF Chatbot',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/icons/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} bg-background text-heading min-h-screen flex flex-col font-sans antialiased selection:bg-primary-100 selection:text-primary-700`}>
        <PwaManager>{children}</PwaManager>
      </body>
    </html>
  );
}
