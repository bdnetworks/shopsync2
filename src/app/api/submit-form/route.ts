
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const scriptUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;

  if (!scriptUrl) {
    console.error('Google Script URL is not configured.');
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
        'Content-Type': 'application/json', // This header is crucial
      },
      body: JSON.stringify(body),
      redirect: 'manual', 
    });

    if (response.status === 0 || response.status === 200 || response.status === 302) {
       return NextResponse.json({ result: 'success' });
    }
    
    try {
        const errorResponse = await response.json();
        console.error('Google Script returned an error:', errorResponse);
        return NextResponse.json(
            { result: 'error', error: errorResponse.error || 'Google Script returned an error.' },
            { status: response.status }
        );
    } catch (e) {
        const errorText = await response.text();
        console.error('Google Script returned a non-JSON error response:', errorText);
        return NextResponse.json(
            { result: 'error', error: 'An unexpected error occurred with the Google Script.' },
            { status: response.status }
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
