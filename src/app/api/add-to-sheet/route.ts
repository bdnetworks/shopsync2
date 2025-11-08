
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // 1. Get the data from the client request
    const body = await req.json();
    const { orderForSheet } = body;

    if (!orderForSheet) {
      return NextResponse.json({ success: false, message: 'Missing order data.' }, { status: 400 });
    }

    // 2. Get the Google Script URL from environment variables
    const googleScriptUrl = process.env.GOOGLE_SCRIPT_URL;
    if (!googleScriptUrl) {
      console.error('CRITICAL: GOOGLE_SCRIPT_URL environment variable is not set.');
      return NextResponse.json({ success: false, message: 'Server configuration error.' }, { status: 500 });
    }

    // 3. Forward the data to the Google Apps Script
    // We wait for the script to finish and give us a response.
    const scriptResponse = await fetch(googleScriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // The script expects the data directly, not nested.
      body: JSON.stringify(orderForSheet),
    });
    
    // Check if the fetch itself was successful
    if (!scriptResponse.ok) {
        const errorText = await scriptResponse.text();
        console.error(`Google Script fetch error: Status ${scriptResponse.status}`, errorText);
        return NextResponse.json({ success: false, message: 'Failed to communicate with Google Sheet service.', details: errorText }, { status: 502 });
    }

    // 4. Parse the response from the Google Apps Script
    const result = await scriptResponse.json();

    // 5. Check if the script reported success
    if (result.success) {
      // The script was successful, so we return a success response to the client.
      return NextResponse.json({ success: true, message: 'Order placed successfully!' });
    } else {
      // The script reported an error. We forward this error to the client.
      console.error('Google Script returned an error:', result.message);
      return NextResponse.json({ success: false, message: 'Google Script returned an error.', details: result.message || 'Unknown script error' }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Error in /api/add-to-sheet:', error);
    return NextResponse.json({ success: false, message: 'An unexpected error occurred.', details: error.message }, { status: 500 });
  }
}
