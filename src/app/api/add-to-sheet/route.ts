import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const orderDetails = await req.json();
  const googleScriptUrl = process.env.GOOGLE_SCRIPT_URL;

  if (!googleScriptUrl) {
    return NextResponse.json({ error: 'Google Script URL is not configured.' }, { status: 500 });
  }

  try {
    const response = await fetch(googleScriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderDetails),
      // Adding a timeout to the fetch request
      signal: AbortSignal.timeout(10000) // 10 seconds timeout
    });

    const result = await response.json();

    if (result.status !== 'success') {
      throw new Error(result.message || 'Failed to post data to Google Sheet.');
    }
    
    return NextResponse.json({ status: 'success', message: 'Order successfully added to sheet.' });

  } catch (error: any) {
    console.error('Error posting to Google Sheet:', error);
    if (error.name === 'TimeoutError') {
        return NextResponse.json({ error: 'Request to Google Sheet timed out.', details: error.message }, { status: 504 });
    }
    return NextResponse.json({ error: 'Failed to add order to sheet.', details: error.message }, { status: 500 });
  }
}
