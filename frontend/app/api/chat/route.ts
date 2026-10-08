import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_LANGGRAPH_API_URL || 'http://localhost:2024';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const backendRes = await fetch(`${BACKEND_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (body.stream && backendRes.body) {
      return new NextResponse(backendRes.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    console.error('[Frontend Next API /api/chat Error]:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to proxy chat request.' },
      { status: 500 }
    );
  }
}
