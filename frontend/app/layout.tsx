import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'AI PDF Chatbot | Educational RAG Dashboard',
  description:
    'SaaS AI PDF Chatbot built with Google Gemini 3.8 Flash, gemini-embedding-2, Supabase pgvector, and LangGraph.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} bg-background text-heading min-h-screen flex flex-col font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
