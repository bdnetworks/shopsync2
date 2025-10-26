'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { siteConfig } from '@/config/site';
import * as SibApiV3Sdk from 'sib-api-v3-sdk';

export const SendOrderInputSchema = z.object({
  customerName: z.string().describe("Customer's full name"),
  customerEmail: z.string().describe("Customer's email address"),
  customerAddress: z.string().describe("Customer's full shipping address"),
  orderItems: z.string().describe("A comma-separated string of items in the order"),
  orderTotal: z.string().describe("The total cost of the order"),
});

export type SendOrderInput = z.infer<typeof SendOrderInputSchema>;

export async function sendOrderEmail(input: SendOrderInput): Promise<void> {
  return sendOrderEmailFlow(input);
}

const sendOrderEmailFlow = ai.defineFlow(
  {
    name: 'sendOrderEmailFlow',
    inputSchema: SendOrderInputSchema,
    outputSchema: z.void(),
  },
  async (input) => {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL;

    if (!apiKey || !senderEmail) {
      console.error("Brevo API key or sender email is not configured in .env file");
      throw new Error("Email service is not configured. Please contact support.");
    }
    
    let defaultClient = SibApiV3Sdk.ApiClient.instance;
    let apiAuth = defaultClient.authentications['api-key'];
    apiAuth.apiKey = apiKey;

    let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

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

    sendSmtpEmail.subject = `Your ${siteConfig.name} Order Confirmation`;
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.sender = { name: siteConfig.name, email: senderEmail };
    sendSmtpEmail.to = [{ email: input.customerEmail, name: input.customerName }];
    // You can add a BCC to receive a copy of the order email
    // sendSmtpEmail.bcc = [{ email: "you@example.com", name: "Your Name" }];

    try {
      await apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log('Order confirmation email sent successfully via Brevo.');
    } catch (error) {
      console.error('Error sending email via Brevo:', error);
      throw new Error('An error occurred while sending the order confirmation email.');
    }
  }
);
