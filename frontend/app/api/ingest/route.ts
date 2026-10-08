import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_LANGGRAPH_API_URL || 'http://localhost:2024';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    const backendRes = await fetch(`${BACKEND_URL}/api/ingest`, {
      method: 'POST',
      body: formData,
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    console.error('[Frontend Next API /api/ingest Error]:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to proxy ingestion request.' },
      { status: 500 }
    );
  }
}
