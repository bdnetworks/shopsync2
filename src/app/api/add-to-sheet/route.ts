
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
      // The body now contains only the data destined for the Google Sheet.
      body: JSON.stringify(orderForSheet),
    });

    if (!sheetResponse.ok) {
      const errorText = await sheetResponse.text();
      console.error('Google Sheet submission failed:', errorText);
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(`Failed to submit to Google Sheet. Status: ${sheetResponse.status}. Message: ${errorJson.message || errorText}`);
      } catch (e) {
        // If parsing fails, throw the original text.
        throw new Error(`Failed to submit to Google Sheet. Status: ${sheetResponse.status}. Message: ${errorText}`);
      }
    }

    const sheetResult = await sheetResponse.json();
    if (!sheetResult.success) {
        throw new Error(`Google Script returned an error: ${sheetResult.message}`);
    }
    
    // Return a success response to the client immediately after sheet submission.
    return NextResponse.json({ success: true, message: 'Order placed and saved to sheet successfully!' });

  } catch (error: any) {
    console.error('Error processing order:', error);
    return NextResponse.json({ success: false, error: 'Failed to process order.', details: error.message }, { status: 500 });
  }
}
