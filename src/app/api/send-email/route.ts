import { NextRequest, NextResponse } from 'next/server';
import { siteConfig } from '@/config/site';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  const { name, email, subject, message } = await req.json();

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_PASS;

  if (!gmailUser || !gmailPass || gmailUser === 'your-email@gmail.com') {
    console.error('Gmail credentials are not configured in .env file.');
    return NextResponse.json({ error: 'Email service is not configured. Please set up GMAIL_USER and GMAIL_PASS in your environment variables.' }, { status: 500 });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailPass, // Use the App Password here
    },
  });

  const mailOptions = {
    from: `"${siteConfig.name}" <${gmailUser}>`,
    to: gmailUser, // Send to your own email
    replyTo: email, // Set customer's email as reply-to
    subject: `New Contact Form: ${subject}`,
    html: `
      <h3>New Contact Form Submission from ${siteConfig.name}</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return NextResponse.json({ success: true, message: 'Email sent successfully!' });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'Failed to send email.', details: error.message }, { status: 500 });
  }
}
