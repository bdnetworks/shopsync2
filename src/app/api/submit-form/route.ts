
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const scriptUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;

  if (!scriptUrl) {
    return NextResponse.json(
      { result: 'error', error: 'Google Script URL is not configured.' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();

    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    // Google Apps Script might not return a 200 OK even on success,
    // so we read the response body to be sure.
    const scriptResponse = await response.json();

    if (scriptResponse.result === 'success') {
      return NextResponse.json(scriptResponse, { status: 200 });
    } else {
      // Pass the error from the script back to the client
      return NextResponse.json(
        { result: 'error', error: scriptResponse.error || 'Google Script returned an error.' },
        { status: 400 }
      );
    }

  } catch (error: any) {
    console.error('API Route Error:', error);
    return NextResponse.json(
      { result: 'error', error: error.message || 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
