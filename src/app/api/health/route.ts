import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export async function GET(){return NextResponse.json({ status:'ok', service:'ghosttrace', aiConfigured:Boolean(process.env.ANTHROPIC_API_KEY) },{headers:{'Cache-Control':'no-store'}});}
