import { NextRequest, NextResponse } from 'next/server';
import fetch from 'node-fetch';

export async function POST(req: NextRequest) {
  try {
    const orderForSheet = await req.json();

    const googleScriptUrl = process.env.GOOGLE_SCRIPT_URL;
    if (!googleScriptUrl) {
      throw new Error('CRITICAL: GOOGLE_SCRIPT_URL environment variable is not set.');
    }

    const scriptResponse = await fetch(googleScriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderForSheet),
      redirect: 'follow',
    });

    const resultText = await scriptResponse.text();
    const result = JSON.parse(resultText);

    if (!scriptResponse.ok || !result.success) {
      throw new Error(`Google Script returned an error: ${result.message || 'Unknown error'}`);
    }

    return NextResponse.json({ success: true, message: 'Order processed successfully.' });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to submit order.', details: error.message }, { status: 500 });
  }
}
