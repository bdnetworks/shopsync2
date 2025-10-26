'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { siteConfig } from '@/config/site';
import nodemailer from 'nodemailer';
import type { SendOrderInput } from '@/lib/types';
import { SendOrderInputSchema } from '@/lib/types';

export async function sendOrderEmail(input: SendOrderInput): Promise<void> {
  const sendOrderEmailFlow = ai.defineFlow(
    {
      name: 'sendOrderEmailFlow',
      inputSchema: SendOrderInputSchema,
      outputSchema: z.void(),
    },
    async (input) => {
      const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SENDER_EMAIL } = process.env;

      if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_SENDER_EMAIL) {
        console.error("SMTP configuration is missing in .env file");
        throw new Error("Email service is not configured. Please contact support.");
      }
      
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: parseInt(SMTP_PORT, 10),
        secure: parseInt(SMTP_PORT, 10) === 465, // true for 465, false for other ports
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      });

      const htmlContent = `
        <h1>Thank you for your order, ${input.customerName}!</h1>
        <p>We've received your order and will process it shortly.</p>
        <h2>Order Summary</h2>
        <p><strong>Address:</strong> ${input.customerAddress}</p>
        <p><strong>Items:</strong></p>
        <ul>
          ${input.orderItems.split(', ').map(item => `<li>${item}</li>`).join('')}
        </ul>
        <h3>Total: ${siteConfig.currency}${input.orderTotal}</h3>
      `;

      const mailOptions = {
        from: `"${siteConfig.name}" <${SMTP_SENDER_EMAIL}>`,
        to: input.customerEmail,
        subject: `Your ${siteConfig.name} Order Confirmation`,
        html: htmlContent,
        // You can add a BCC to receive a copy of the order email
        // bcc: 'you@example.com'
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log('Order confirmation email sent successfully via SMTP.');
      } catch (error) {
        console.error('Error sending email via SMTP:', error);
        throw new Error('An error occurred while sending the order confirmation email.');
      }
    }
  );
  
  return sendOrderEmailFlow(input);
}
