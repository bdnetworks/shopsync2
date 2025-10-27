
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { siteConfig } from '@/config/site';

const resend = new Resend(process.env.RESEND_API_KEY);
const toEmail = siteConfig.checkout.contact.email;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY is not set. Email will not be sent. Using fallback for local development.");
       return NextResponse.json({ message: 'Email sent successfully (fallback)' });
    }

    const { data, error } = await resend.emails.send({
      from: 'ShopSync Contact Form <onboarding@resend.dev>',
      to: [toEmail],
      subject: `New Message from ShopSync: ${subject}`,
      reply_to: email as string,
      html: `
        <p>You have received a new message from the contact form.</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    if (error) {
      console.error('Resend API Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json({ error: 'Something went wrong on the server.' }, { status: 500 });
  }
}
