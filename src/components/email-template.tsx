
import * as React from 'react';

interface EmailTemplateProps {
  name: string;
  email: string;
  message: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  name,
  email,
  message,
}) => (
  <div style={{ fontFamily: 'sans-serif', lineHeight: '1.6' }}>
    <h1 style={{ color: '#333' }}>New Contact Form Submission</h1>
    <p>You have received a new message from your website contact form.</p>
    <hr />
    <h2>Message Details:</h2>
    <ul>
      <li><strong>Name:</strong> {name}</li>
      <li><strong>Email:</strong> <a href={`mailto:${email}`}>{email}</a></li>
    </ul>
    <h2>Message:</h2>
    <p
      style={{
        border: '1px solid #ddd',
        padding: '10px',
        borderRadius: '5px',
        whiteSpace: 'pre-wrap',
      }}
    >
      {message}
    </p>
  </div>
);
