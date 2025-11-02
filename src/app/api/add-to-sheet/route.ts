import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const orderForSheet = await req.json();
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
      body: JSON.stringify(orderForSheet),
      signal: AbortSignal.timeout(10000) // 10 seconds timeout
    });
    
    // The response from a Google Apps Script web app when posting might be a redirect.
    // We can't easily parse the result, but we can check if the request was successful.
    // A successful POST that appends a row usually results in a 200 OK with a redirect.
    if (response.ok) {
        // Assuming success if the request was okay.
        // For more robust checking, the Apps Script should return a JSON response.
        return NextResponse.json({ status: 'success', message: 'Order successfully submitted to sheet.' });
    } else {
        // If the script returns an error, it might be in JSON format.
        const result = await response.json();
        throw new Error(result.message || `Failed to post data to Google Sheet. Status: ${response.status}`);
    }

  } catch (error: any) {
    console.error('Error posting to Google Sheet:', error);
    if (error.name === 'TimeoutError') {
        return NextResponse.json({ error: 'Request to Google Sheet timed out.', details: error.message }, { status: 504 });
    }
    return NextResponse.json({ error: 'Failed to add order to sheet.', details: error.message }, { status: 500 });
  }
}
