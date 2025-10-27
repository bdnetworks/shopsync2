
import { NextResponse } from 'next/server';

const GOOGLE_FORM_ACTION_URL = process.env.GOOGLE_FORM_ACTION_URL;

// IMPORTANT: These entry IDs must match the ones in your Google Form.
// To get these, create a pre-filled link for your form. The URL will contain the entry IDs.
const ENTRY_IDS = {
  name: 'entry.224376188',
  email: 'entry.1389401831',
  subject: 'entry.1715219048',
  message: 'entry.1263451416',
};

export async function POST(request: Request) {
  try {
    if (!GOOGLE_FORM_ACTION_URL) {
      throw new Error('Google Form action URL is not configured in environment variables.');
    }

    const formData = await request.json();
    
    // Map form data to Google Form entry IDs
    const googleFormData = new URLSearchParams();
    googleFormData.append(ENTRY_IDS.name, formData.name);
    googleFormData.append(ENTRY_IDS.email, formData.email);
    googleFormData.append(ENTRY_IDS.subject, formData.subject);
    googleFormData.append(ENTRY_IDS.message, formData.message);

    const response = await fetch(GOOGLE_FORM_ACTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: googleFormData.toString(),
    });

    if (response.ok) {
      return NextResponse.json({ message: 'Form submitted successfully' });
    } else {
       // Even if Google returns a non-200 status, it often means the submission was accepted.
       // We'll log the status but still return a success response to the client.
      console.warn(`Google Forms responded with status: ${response.status}`);
      return NextResponse.json({ message: 'Form submitted successfully (with warning)' });
    }
  } catch (error: any) {
    console.error('Error submitting form to Google:', error);
    return NextResponse.json({ error: error.message || 'An unknown error occurred.' }, { status: 500 });
  }
}
