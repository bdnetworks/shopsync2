
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const orderData = await req.json();
    
    const googleScriptUrl = process.env.GOOGLE_SCRIPT_URL;
    if (!googleScriptUrl) {
      throw new Error("Google Script URL is not configured on the server.");
    }

    const scriptResponse = await fetch(googleScriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    const result: any = await scriptResponse.json();

    if (!scriptResponse.ok || result.success !== true) {
      // Log the error from Google Script if available
      console.error("Google Script Error:", result.message);
      throw new Error(result.message || 'The Google Script returned an error.');
    }

    return NextResponse.json({ success: true, message: 'Order submitted to Google Sheet successfully.' });

  } catch (error: any) {
    console.error('API Route Error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}
