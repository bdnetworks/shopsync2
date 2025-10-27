
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { EmailTemplate } from '@/components/email-template';

const resend = new Resend(process.env.RESEND_API_KEY);
const toEmail = process.env.TO_EMAIL || 'saakib.com@gmail.com';

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: 'Contact Form <onboarding@resend.dev>',
      to: [toEmail],
      subject: `New Message from ${name}: ${subject}`,
      react: EmailTemplate({ name, email, message }),
      reply_to: email,
    });

    if (error) {
      console.error('Resend API Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Email sent successfully!', data });
  } catch (error: any) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}
