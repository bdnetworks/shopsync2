
import { NextResponse } from 'next/server';

async function submitToGoogleForm(data: Record<string, string>) {
    const formId = process.env.GOOGLE_FORM_ID;
    const entryMap = {
        name: process.env.GOOGLE_FORM_ENTRY_NAME,
        email: process.env.GOOGLE_FORM_ENTRY_EMAIL,
        subject: process.env.GOOGLE_FORM_ENTRY_SUBJECT,
        message: process.env.GOOGLE_FORM_ENTRY_MESSAGE,
    };

    if (!formId || !entryMap.name || !entryMap.email || !entryMap.subject || !entryMap.message) {
        console.error('Google Form environment variables are not set.');
        throw new Error('Server configuration error. Could not submit form.');
    }

    const url = `https://docs.google.com/forms/d/e/${formId}/formResponse`;
    
    const formData = new FormData();
    formData.append(entryMap.name, data.name);
    formData.append(entryMap.email, data.email);
    formData.append(entryMap.subject, data.subject);
    formData.append(entryMap.message, data.message);

    try {
        await fetch(url, {
            method: 'POST',
            body: formData,
            mode: 'no-cors',
        });
    } catch (error) {
        console.error('Error submitting to Google Form:', error);
        throw new Error('Failed to submit form to Google.');
    }
}


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await submitToGoogleForm({ name, email, subject, message });

    return NextResponse.json({ message: 'Form submitted successfully' });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Something went wrong.' }, { status: 500 });
  }
}
