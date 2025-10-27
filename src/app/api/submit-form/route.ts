import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const scriptURL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;

  if (!scriptURL) {
    return NextResponse.json(
      { error: 'Google Script URL is not configured.' },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    
    // The Google Apps Script expects the data in a specific format.
    // We will send it as 'application/x-www-form-urlencoded'.
    const response = await fetch(scriptURL, {
      method: 'POST',
      body: formData,
    });

    // Google Apps Script usually redirects on success. A 200 OK or a redirect status is a good sign.
    if (response.ok || response.status === 302) {
       const result = await response.json();
       if (result.result === 'success') {
        return NextResponse.json({ message: 'Form submitted successfully!' });
       } else {
        // This captures errors reported by the script itself
        return NextResponse.json({ error: result.error || 'An error occurred in the Google Script.' }, { status: 500 });
       }
    } else {
      // This captures network or server errors
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Failed to submit to Google Script. Status: ${response.status}. Message: ${errorText}` },
        { status: response.status }
      );
    }
  } catch (error: any) {
    console.error('API Route Error:', error);
    return NextResponse.json(
      { error: error.message || 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
