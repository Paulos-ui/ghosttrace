import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET() {
  return NextResponse.json({
    configured: Boolean(process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_API_KEY.startsWith('your_')),
    model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-6',
    provider: 'Anthropic Claude',
    openWeightModel: 'Xenova/all-MiniLM-L6-v2',
    openWeightRuntime: 'Browser / Transformers.js',
    keyExposed: false,
  }, { headers: { 'Cache-Control': 'no-store' } });
}
