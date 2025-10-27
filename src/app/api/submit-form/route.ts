
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
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      // IMPORTANT: Change 'follow' to 'manual' to handle Google's redirect response correctly.
      redirect: 'manual', 
    });

    // When using redirect: 'manual', a successful POST to Google Apps Script
    // will result in a response with type 'opaqueredirect' and a status of 0 or a 302 status.
    // We can treat this as a success.
    if (response.status === 0 || response.status === 200 || response.status === 302) {
       return NextResponse.json({ result: 'success' });
    }
    
    // If we get here, something went wrong on the script side.
    // We try to parse the error for better debugging.
    try {
        const errorResponse = await response.json();
        console.error('Google Script returned an error:', errorResponse);
        return NextResponse.json(
            { result: 'error', error: errorResponse.error || 'Google Script returned an error.' },
            { status: response.status }
        );
    } catch (e) {
        // If the response is not JSON, read it as text.
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
