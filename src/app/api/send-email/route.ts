
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const apiKey = process.env.ELASTIC_EMAIL_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'Elastic Email API key is not configured.' }, { status: 500 });
  }

  try {
    const { name, email, subject, message } = await req.json();
    
    const emailBody = new URLSearchParams({
        apiKey: apiKey,
        subject: subject,
        from: 'saakib.com@gmail.com', // This should be a verified email in your Elastic Email account
        to: 'saakib.com@gmail.com',
        bodyHtml: `
            <h3>New Contact Form Submission</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
        `,
        isTransactional: 'true'
    }).toString();

    const response = await fetch('https://api.elasticemail.com/v2/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: emailBody,
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Elastic Email API Error:', errorText);
        throw new Error('Failed to send email. API returned an error.');
    }

    const data = await response.json();

    if (data.success !== true) {
        throw new Error(data.error || 'Elastic Email failed to send the email.');
    }

    return NextResponse.json({ success: true, message: 'Email sent successfully!' });

  } catch (error: any) {
    console.error('Error handling email request:', error);
    return NextResponse.json({ error: error.message || 'An unknown error occurred.' }, { status: 500 });
  }
}
