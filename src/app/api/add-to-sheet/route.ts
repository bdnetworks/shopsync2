
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { orderForSheet } = await req.json();
    
    const googleScriptUrl = process.env.GOOGLE_SCRIPT_URL;
    if (!googleScriptUrl) {
      throw new Error('Google Script URL is not configured. Please set GOOGLE_SCRIPT_URL environment variable.');
    }

    const sheetResponse = await fetch(googleScriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderForSheet),
    });

    // It's crucial to check if the response is OK before parsing JSON
    if (!sheetResponse.ok) {
      const errorText = await sheetResponse.text();
      // Try to parse as JSON for a more structured error, but fall back to text.
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(`Failed to submit to Google Sheet. Status: ${sheetResponse.status}. Message: ${errorJson.message || 'Unknown script error'}`);
      } catch (e) {
        throw new Error(`Failed to submit to Google Sheet. Status: ${sheetResponse.status}. Message: ${errorText}`);
      }
    }

    const sheetResult = await sheetResponse.json();

    // The Google Script should return a `success` property. Check for it.
    if (!sheetResult.success) {
        // If the script itself reports a failure, pass its message along.
        throw new Error(`Google Script returned an error: ${sheetResult.message || 'No specific error message provided.'}`);
    }
    
    // If everything is successful, return a success response to the client.
    return NextResponse.json({ success: true, message: 'Order placed and saved to sheet successfully!' });

  } catch (error: any) {
    console.error('Error processing order:', error);
    // Ensure a consistent error response format.
    return NextResponse.json({ success: false, message: 'Failed to process order.', details: error.message }, { status: 500 });
  }
}
