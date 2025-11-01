import { NextRequest, NextResponse } from 'next/server';
import { siteConfig } from '@/config/site';

export async function POST(req: NextRequest) {
  const { name, email, subject, message } = await req.json();

  const apiKey = process.env.ELASTIC_EMAIL_API_KEY;
  const adminEmail = "saakib.com@gmail.com"; 

  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
    console.error('Elastic Email API Key is not configured.');
    return NextResponse.json({ error: 'Email service is not configured. Please set up ELASTIC_EMAIL_API_KEY in your environment variables.' }, { status: 500 });
  }

  const formData = new URLSearchParams();
  formData.append('apikey', apiKey);
  formData.append('subject', `New Contact Form: ${subject}`);
  formData.append('from', adminEmail); // This MUST be a verified sender in your Elastic Email account.
  formData.append('fromName', siteConfig.name);
  formData.append('to', adminEmail);
  formData.append('replyTo', email); // Set customer's email as reply-to
  formData.append('bodyHtml', `
    <h3>New Contact Form Submission from ${siteConfig.name}</h3>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Subject:</strong> ${subject}</p>
    <p><strong>Message:</strong></p>
    <p>${message.replace(/\n/g, '<br>')}</p>
  `);
  formData.append('isTransactional', 'true');

  try {
    const response = await fetch('https://api.elasticemail.com/v2/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    const result = await response.json();

    if (!result.success) {
      console.error('Elastic Email API Error:', result.error);
      throw new Error(result.error || 'Failed to send email.');
    }

    return NextResponse.json({ success: true, message: 'Email sent successfully!' });

  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'Failed to send email.', details: error.message }, { status: 500 });
  }
}
